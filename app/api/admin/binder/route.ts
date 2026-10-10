import { PDFDocument, PDFFont, PDFPage, PDFName, PDFHexString, PDFArray, PDFDict, PDFRef, StandardFonts, rgb } from "pdf-lib";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import { searchFida, SearchHit, claudeJson, auditAtticus } from "@/lib/atticus-search";
import { BINDER_TABS, BinderTab } from "@/lib/binder-tabs";

// FIDA Audit Binder. Admin-only (middleware gates /api/admin/*).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
const badRequest = (msg: string) => json({ error: msg }, 400);
const SCHOOL = "Florida Institute of Dental Assisting";

interface Plan { title: string; reviewer: string; scope: string; date_range: string | null; tabs: number[]; student_id?: string | null; student_name?: string | null }
interface DocRef { source_table: SearchHit["source_table"]; document_id: string; file_name: string; page_no: number }
interface ItemResult { item: string; status: "found" | "missing"; docs: DocRef[] }
interface TabResult { tab: BinderTab; items: ItemResult[] }

const TAB_LIST = BINDER_TABS.map((t) => `${t.n}. ${t.name} — ${t.items.join("; ")}`).join("\n");

// POST /api/admin/binder
//   { mode: "plan", request }  -> Atticus echoes back a plan for the owner to confirm
//   { mode: "build", plan }    -> builds the PDF binder + gap report, returns a download link
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  try {
    if (body.mode === "plan") {
      const request = String(body.request || "").trim().slice(0, 1500);
      if (!request) return badRequest("Tell Atticus what the binder is for");
      const { data: studs } = await getServerClient().from("students").select("id, full_name, student_number, program").limit(500);
      const roster = (studs ?? []).map((s) => `${s.id} | ${s.full_name} | ${s.student_number ?? ""} | ${s.program ?? ""}`).join("\n");
      const plan = await claudeJson<Plan>(
        `You plan audit binders for ${SCHOOL}, a career school. Given the owner's request, decide who the reviewer is, the scope, any date range, and which binder tabs to include.
Tabs:\n${TAB_LIST}
Rules: a full inspection, renewal, licensing visit or accreditation visit uses all 14 tabs. A narrow request (e.g. an attorney asking about refunds) uses only the tabs that apply. A request about ONE student uses tab 10 plus any tabs the request names, and sets student_id from the roster (id | name | student number | program). Never invent facts.
JSON shape: {"title": string, "reviewer": string, "scope": string (one sentence), "date_range": string|null, "tabs": number[], "student_id": string|null, "student_name": string|null}`,
        `Roster:\n${roster || "(none)"}\n\nOwner's request: ${request}`, 700);
      if (plan.student_id && !(studs ?? []).some((s) => s.id === plan.student_id)) { plan.student_id = null; plan.student_name = null; }
      plan.tabs = [...new Set((plan.tabs || []).map(Number))].filter((n) => BINDER_TABS.some((t) => t.n === n)).sort((a, b) => a - b);
      if (plan.tabs.length === 0) plan.tabs = BINDER_TABS.map((t) => t.n);
      return json({ plan });
    }

    if (body.mode === "build") {
      const plan = body.plan as Plan;
      if (!plan?.tabs?.length) return badRequest("plan is required");
      const tabs = BINDER_TABS.filter((t) => plan.tabs.includes(t.n));
      const sb = getServerClient();
      let student: Record<string, unknown> | null = null;
      let studentKeys: string[] = [];
      if (plan.student_id) {
        const { data } = await sb.from("students").select("id, student_number, full_name, program, cohort_id, start_date, status, modality, hs_credential, id_verified_method, id_verified_at, withdrawn_at")
          .eq("id", plan.student_id).maybeSingle();
        if (data) {
          const { data: ea } = await sb.from("enrollment_agreements").select("version, status, sent_at, signed_at, countersigned_at")
            .eq("student_id", data.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
          student = { ...data, agreement_version: ea?.version ?? null, agreement_status: ea?.status ?? null, agreement_signed: ea?.signed_at ?? null, agreement_countersigned: ea?.countersigned_at ?? null };
          studentKeys = [String(data.id), data.student_number ? String(data.student_number) : ""].filter(Boolean);
        }
      }
      const results = await Promise.all(tabs.map((t) => judgeTab(t, plan, t.n === 10 ? studentKeys : [])));
      const pdfBytes = await buildPdf(SCHOOL, plan, results, "FIDA administration", student);

      const path = `atticus-binders/${Date.now()}_atticus-binder.pdf`;
      const { error: upErr } = await sb.storage.from("document-vault").upload(path, Buffer.from(pdfBytes), {
        contentType: "application/pdf", upsert: false,
      });
      if (upErr) throw new Error(`Saving the binder failed: ${upErr.message}`);
      const { data: signed } = await sb.storage.from("document-vault").createSignedUrl(path, 60 * 60, {
        download: `Atticus Binder - ${plan.title}.pdf`.replace(/[^\w .()-]+/g, ""),
      });
      const found = results.flatMap((r) => r.items).filter((i) => i.status === "found").length;
      const missing = results.flatMap((r) => r.items).filter((i) => i.status === "missing").length;
      await auditAtticus("binder_built", {
        title: plan.title, reviewer: plan.reviewer, tabs: plan.tabs, student_id: plan.student_id ?? null, found, missing, path,
        sha256: createHash("sha256").update(pdfBytes).digest("hex"),
      });
      return json({
        url: signed?.signedUrl ?? null, found, missing,
        gaps: results.map((r) => ({ tab: r.tab.n, name: r.tab.name, missing: r.items.filter((i) => i.status === "missing").map((i) => i.item) })),
      });
    }
    return badRequest("mode must be plan or build");
  } catch (e) {
    return json({ error: (e as Error).message || "Binder failed" }, 500);
  }
}

async function judgeTab(tab: BinderTab, plan: Plan, studentKeys: string[]): Promise<TabResult> {
  let hits: SearchHit[] = [];
  try { hits = await searchFida(`${tab.query} ${plan.scope}`, 12, studentKeys); } catch { hits = []; }
  if (hits.length === 0) return { tab, items: tab.items.map((item) => ({ item, status: "missing", docs: [] })) };
  const ctx = hits.map((h, i) => `[${i + 1}] ${h.file_name}, page ${h.page_no}\n${h.text.slice(0, 900)}`).join("\n\n");
  type J = { items: { item: string; status: string; sources: number[] }[] };
  let j: J;
  try {
    j = await claudeJson<J>(
      `You check ${SCHOOL}'s files for an audit binder tab. For each required item decide if the excerpts show the school HAS that document. Mark "found" only when an excerpt is clearly that document (or part of it); otherwise "missing". Do not stretch: a contract that mentions a policy is not the policy itself.
JSON shape: {"items":[{"item": string (exactly as given), "status": "found"|"missing", "sources": number[] (excerpt numbers, empty if missing)}]}`,
      `Tab: ${tab.name}\nRequired items:\n${tab.items.map((x) => `- ${x}`).join("\n")}\n\nExcerpts:\n${ctx}`, 900);
  } catch {
    return { tab, items: tab.items.map((item) => ({ item, status: "missing", docs: [] })) };
  }
  const items: ItemResult[] = tab.items.map((item) => {
    const r = j.items?.find((x) => x.item === item);
    const docs = (r?.status === "found" ? r.sources : [])
      .map((n) => hits[n - 1]).filter(Boolean)
      .map((h) => ({ source_table: h.source_table, document_id: h.document_id, file_name: h.file_name, page_no: h.page_no }));
    return { item, status: docs.length ? "found" : "missing", docs };
  });
  return { tab, items };
}

// ---------------- PDF assembly ----------------
const W = 612, H = 792, M = 54;
const NAVY = rgb(0.06, 0.16, 0.32), INK = rgb(0.1, 0.1, 0.12), MUTED = rgb(0.42, 0.42, 0.46);
const OK = rgb(0.12, 0.45, 0.25), BAD = rgb(0.72, 0.18, 0.12);

// Standard fonts only encode WinAnsi; replace anything else so drawing never throws.
const WINANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function safe(s: string): string {
  return Array.from(s.replace(/[✓✔]/g, "+").replace(/[✗✘]/g, "x").replace(/[≤]/g, "<=").replace(/[≥]/g, ">="))
    .map((c) => (c.charCodeAt(0) < 256 || WINANSI_EXTRA.includes(c) ? c : "?")).join("");
}
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of safe(text).split("\n")) {
    let line = "";
    for (const w of para.split(/\s+/)) {
      const next = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) > width && line) { out.push(line); line = w; } else line = next;
    }
    out.push(line);
  }
  return out;
}

async function buildPdf(school: string, plan: Plan, results: TabResult[], preparedBy: string, student: Record<string, unknown> | null): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "America/New_York" });
  const text = (p: PDFPage, s: string, x: number, y: number, size = 11, f = reg, color = INK) =>
    p.drawText(safe(s), { x, y, size, font: f, color });

  // --- Cover
  const cover = doc.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: H - 160, width: W, height: 160, color: NAVY });
  text(cover, "Atticus™ Audit Binder", M, H - 90, 30, bold, rgb(1, 1, 1));
  text(cover, school, M, H - 125, 14, reg, rgb(0.85, 0.9, 1));
  let y = H - 220;
  for (const [k, v] of [["Binder", plan.title], ["Prepared for", plan.reviewer], ["Scope", plan.scope],
    ["Date range", plan.date_range || "All records on file"], ...(plan.student_name ? [["Student", plan.student_name] as const] : []), ["Prepared", `${today} by Atticus for ${preparedBy}`]] as const) {
    text(cover, k.toUpperCase(), M, y, 9, bold, MUTED); y -= 16;
    for (const l of wrap(v, reg, 13, W - 2 * M)) { text(cover, l, M, y, 13); y -= 18; }
    y -= 12;
  }
  text(cover, "Every page after the tab dividers is the school's original record. Footers name the source file and page.", M, 70, 9, reg, MUTED);

  // --- Gap report (may run several pages)
  const all = results.flatMap((r) => r.items);
  const nFound = all.filter((i) => i.status === "found").length;
  let gp = doc.addPage([W, H]); y = H - M;
  const gapPages = [gp];
  text(gp, "Gap report", M, y, 22, bold, NAVY); y -= 24;
  text(gp, `${nFound} of ${all.length} expected items found. Missing items are listed so they can be gathered before the review.`, M, y, 10, reg, MUTED); y -= 26;
  for (const r of results) {
    const need = 22 + r.items.length * 15;
    if (y - need < M) { gp = doc.addPage([W, H]); gapPages.push(gp); y = H - M; }
    text(gp, `Tab ${r.tab.n}  ${r.tab.name}`, M, y, 12, bold); text(gp, `CIE ${r.tab.cie}  |  ACCSC ${r.tab.accsc}`, W - M - 190, y, 8, reg, MUTED); y -= 16;
    for (const it of r.items) {
      const ok = it.status === "found";
      text(gp, ok ? "FOUND" : "MISSING", M + 10, y, 8, bold, ok ? OK : BAD);
      const where = ok ? `  -  ${it.docs.map((d) => `${d.file_name} p.${d.page_no}`).slice(0, 2).join("; ")}` : "";
      text(gp, (it.item + where).slice(0, 110), M + 62, y, 9.5); y -= 15;
    }
    y -= 8;
  }

  // --- Student record summary (student binders only) — from FIDA's student system, not a file
  let studentPage: PDFPage | null = null;
  if (student) {
    studentPage = doc.addPage([W, H]); let sy = H - M;
    text(studentPage, "Student record", M, sy, 22, bold, NAVY); sy -= 22;
    text(studentPage, "From FIDA's student information system as of the date this binder was prepared.", M, sy, 10, reg, MUTED); sy -= 28;
    for (const [k, v] of Object.entries(student)) {
      if (k === "id") continue;
      text(studentPage, k.replace(/_/g, " ").toUpperCase(), M, sy, 8, bold, MUTED);
      text(studentPage, v == null || v === "" ? "-" : String(v).slice(0, 80), M + 170, sy, 10.5); sy -= 18;
    }
  }

  // --- Table of contents (one page) — page numbers filled after the body is laid out
  const toc = doc.addPage([W, H]);

  // --- Body: a divider per tab, then the original documents found for it
  const tabStart: { n: number; name: string; page: number; ref: PDFRef }[] = [];
  const pdfCache = new Map<string, PDFDocument | null>();
  for (const r of results) {
    const div = doc.addPage([W, H]);
    tabStart.push({ n: r.tab.n, name: r.tab.name, page: doc.getPageCount(), ref: div.ref });
    div.drawRectangle({ x: 0, y: 0, width: 18, height: H, color: NAVY });
    text(div, `TAB ${r.tab.n}`, M, H - 120, 14, bold, MUTED);
    text(div, r.tab.name, M, H - 150, 26, bold, NAVY);
    text(div, `CIE ${r.tab.cie}   |   ACCSC ${r.tab.accsc}`, M, H - 175, 10, reg, MUTED);
    let dy = H - 220;
    for (const it of r.items) {
      text(div, `${it.status === "found" ? "[x]" : "[  ]"}  ${it.item}`, M, dy, 11, reg, it.status === "found" ? INK : BAD); dy -= 17;
    }
    const docKeys = [...new Set(r.items.flatMap((i) => i.docs.map((d) => `${d.source_table}:${d.document_id}`)))];
    for (const key of docKeys) {
      if (!pdfCache.has(key)) pdfCache.set(key, await loadSourcePdf(key));
      const src = pdfCache.get(key);
      const fileName = r.items.flatMap((i) => i.docs).find((d) => `${d.source_table}:${d.document_id}` === key)?.file_name ?? "document";
      if (!src) { dy -= 6; text(div, `Could not attach ${fileName} (not a PDF or image).`, M, dy, 9, reg, BAD); dy -= 14; continue; }
      const pages = await doc.copyPages(src, src.getPageIndices());
      pages.forEach((p, i) => {
        doc.addPage(p);
        // Small source stamp in the bottom margin; the original record itself is not covered or altered.
        p.drawText(safe(`Tab ${r.tab.n} ${r.tab.name}  |  Source: ${fileName}, page ${i + 1} of ${pages.length}  |  Atticus binder ${today}`).slice(0, 150),
          { x: 18, y: 5, size: 6.5, font: reg, color: MUTED });
      });
    }
  }

  // --- Fill the TOC
  let ty = H - M;
  text(toc, "Contents", M, ty, 22, bold, NAVY); ty -= 34;
  text(toc, "Gap report", M, ty, 12); text(toc, String(2), W - M - 20, ty, 12); ty -= 20;
  if (studentPage) { text(toc, "Student record", M, ty, 12); text(toc, String(doc.getPages().indexOf(studentPage) + 1), W - M - 20, ty, 12); ty -= 20; }
  for (const t of tabStart) {
    text(toc, `Tab ${t.n}   ${t.name}`, M, ty, 12); text(toc, String(t.page), W - M - 20, ty, 12); ty -= 20;
  }

  // --- Page numbers on every page after the cover
  const total = doc.getPageCount();
  doc.getPages().forEach((p, i) => {
    if (i === 0) return;
    const { width, height } = p.getSize();
    p.drawText(`${i + 1} / ${total}`, { x: width - 60, y: height - 20, size: 8, font: reg, color: MUTED });
  });

  addOutline(doc, [
    { title: "Gap report", ref: gapPages[0].ref },
    { title: "Contents", ref: toc.ref },
    ...tabStart.map((t) => ({ title: `Tab ${t.n}  ${t.name}`, ref: t.ref })),
  ]);
  doc.setTitle(safe(`Atticus Audit Binder - ${plan.title}`));
  doc.setProducer("Atticus");
  return doc.save();
}

async function loadSourcePdf(key: string): Promise<PDFDocument | null> {
  const [table, id] = key.split(":");
  const bucket = table === "document_records" ? "document-vault" : table === "student_documents" ? "student-documents" : null;
  if (!bucket) return null;
  const sb = getServerClient();
  const { data: row } = await sb.from(table).select("storage_path, mime_type").eq("id", Number(id)).maybeSingle();
  if (!row?.storage_path) return null;
  const { data: blob } = await sb.storage.from(bucket).download(row.storage_path);
  if (!blob) return null;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const p = String(row.storage_path).toLowerCase();
  try {
    if (row.mime_type === "application/pdf" || p.endsWith(".pdf")) return await PDFDocument.load(bytes, { ignoreEncryption: true });
    if (/\.(png|jpe?g)$/.test(p)) {
      const d = await PDFDocument.create();
      const img = p.endsWith(".png") ? await d.embedPng(bytes) : await d.embedJpg(bytes);
      const s = Math.min((W - 2 * M) / img.width, (H - 2 * M) / img.height, 1);
      d.addPage([W, H]).drawImage(img, { x: (W - img.width * s) / 2, y: (H - img.height * s) / 2, width: img.width * s, height: img.height * s });
      return d;
    }
  } catch { return null; }
  return null;
}

// Bookmarks panel (PDF outline): one flat entry per section.
function addOutline(doc: PDFDocument, entries: { title: string; ref: PDFRef }[]) {
  if (!entries.length) return;
  const ctx = doc.context;
  const rootRef = ctx.nextRef();
  const refs = entries.map(() => ctx.nextRef());
  entries.forEach((e, i) => {
    const dict = ctx.obj({}) as PDFDict;
    dict.set(PDFName.of("Title"), PDFHexString.fromText(e.title));
    dict.set(PDFName.of("Parent"), rootRef);
    const dest = ctx.obj([]) as PDFArray;
    dest.push(e.ref); dest.push(PDFName.of("Fit"));
    dict.set(PDFName.of("Dest"), dest);
    if (i > 0) dict.set(PDFName.of("Prev"), refs[i - 1]);
    if (i < entries.length - 1) dict.set(PDFName.of("Next"), refs[i + 1]);
    ctx.assign(refs[i], dict);
  });
  const root = ctx.obj({}) as PDFDict;
  root.set(PDFName.of("Type"), PDFName.of("Outlines"));
  root.set(PDFName.of("First"), refs[0]);
  root.set(PDFName.of("Last"), refs[refs.length - 1]);
  root.set(PDFName.of("Count"), ctx.obj(entries.length));
  ctx.assign(rootRef, root);
  doc.catalog.set(PDFName.of("Outlines"), rootRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}
