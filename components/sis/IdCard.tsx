import { code128Svg } from "@/lib/code128";

/** Printable student ID card (CR80 proportions). Server-safe — pure SVG/markup. */
export default function IdCard({
  school,
  photoUrl,
  name,
  preferredName,
  studentNumber,
  program,
  cohort,
  validThrough,
}: {
  school: string;
  photoUrl: string | null;
  name: string;
  preferredName: string | null;
  studentNumber: string | null;
  program: string | null;
  cohort: string | null;
  validThrough: string | null;
}) {
  const bc = studentNumber ? code128Svg(studentNumber, 1.6, 38) : null;
  return (
    <div
      className="id-card bg-white border border-rule rounded-xl overflow-hidden shadow-sm"
      style={{ width: 340, height: 214 }}
    >
      <div className="bg-navy text-white px-4 py-2 flex items-center justify-between">
        <span className="font-display text-[15px] leading-tight">{school}</span>
        <span className="text-[9px] uppercase tracking-[0.14em] opacity-80">Student</span>
      </div>
      <div className="flex gap-3 px-4 pt-3">
        <div className="w-[72px] h-[90px] rounded-sm bg-paper-subtle border border-rule overflow-hidden shrink-0 flex items-center justify-center text-[10px] text-subtle">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            "No photo"
          )}
        </div>
        <div className="min-w-0 text-[11px] leading-snug text-ink">
          <div className="font-display text-[17px] leading-tight text-navy truncate">{name}</div>
          {preferredName && <div className="text-muted">&ldquo;{preferredName}&rdquo;</div>}
          <div className="mt-1.5"><span className="text-subtle">ID</span> {studentNumber ?? "—"}</div>
          <div className="truncate"><span className="text-subtle">Program</span> {program ?? "—"}</div>
          {cohort && <div><span className="text-subtle">Cohort</span> {cohort}</div>}
          <div><span className="text-subtle">Valid thru</span> {validThrough ?? "—"}</div>
        </div>
      </div>
      <div className="px-4 pt-1 flex justify-center">
        {bc ? (
          <svg width={bc.width} height={bc.height} viewBox={`0 0 ${bc.width} ${bc.height}`} aria-label={`Barcode ${studentNumber}`}>
            <rect width={bc.width} height={bc.height} fill="#fff" />
            {bc.rects.map((r, i) => (
              <rect key={i} x={r.x} y={0} width={r.w} height={bc.height} fill="#000" />
            ))}
          </svg>
        ) : (
          <div className="text-[10px] text-subtle py-3">Assign a Student ID to generate the barcode</div>
        )}
      </div>
    </div>
  );
}
