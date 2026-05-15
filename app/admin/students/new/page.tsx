import Link from "next/link";

export const metadata = {
  title: "New student — FIDA Admin",
};

export default function NewStudentPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-3">Students</div>
        <h1 className="text-3xl md:text-4xl mb-2">New student</h1>
        <p className="text-muted max-w-prose">
          Enter a new student profile directly. For bulk import, use the{" "}
          <Link href="/admin/students/upload" className="underline">
            CSV importer
          </Link>{" "}
          instead.
        </p>
      </div>

      <form
        action="/api/admin/students/create"
        method="POST"
        className="max-w-2xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field name="firstname" label="First name" required />
          <Field name="lastname" label="Last name" required />
          <Field name="email" label="Email" type="email" required />
          <Field name="phone" label="Phone" type="tel" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            name="program"
            label="Program"
            required
            options={[
              { value: "radiography", label: "Radiography for Dental Personnel" },
              { value: "efda", label: "Expanded Functions Dental Auxiliary (EFDA)" },
              { value: "dental-assisting", label: "Dental Assisting Foundation" },
            ]}
          />
          <Field name="cohort" label="Cohort (optional)" placeholder="e.g. Summer 2026" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field name="start_date" label="Start date" type="date" />
          <Field name="lead_source" label="Lead source" placeholder="e.g. Atticus, referral, walk-in" />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Notes</label>
          <textarea
            name="notes"
            rows={4}
            className="w-full rounded-sm border border-rule bg-white px-3 py-2 text-sm text-ink outline-none focus:border-teal"
            placeholder="Anything admissions should know about this student."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">Create student</button>
          <Link href="/admin/students" className="btn-secondary">Cancel</Link>
        </div>

        <p className="text-xs text-subtle pt-2">
          Note: this writes to the students table once Supabase is wired. Until then
          the submission is logged but no record is persisted.
        </p>
      </form>
    </div>
  );
}

function Field({
  name, label, type = "text", required = false, placeholder,
}: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        {label}{required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        type={type} name={name} required={required} placeholder={placeholder}
        className="w-full rounded-sm border border-rule bg-white px-3 py-2 text-sm text-ink outline-none focus:border-teal"
      />
    </div>
  );
}

function Select({
  name, label, options, required = false,
}: { name: string; label: string; options: { value: string; label: string }[]; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        {label}{required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <select
        name={name} required={required} defaultValue=""
        className="w-full rounded-sm border border-rule bg-white px-3 py-2 text-sm text-ink outline-none focus:border-teal"
      >
        <option value="" disabled>Select a program…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
