import Link from "next/link";

const stats = [
  { label: "Mock exams taken", value: "4" },
  { label: "Average score", value: "71%" },
  { label: "Weakest domain", value: "Ocular pharmacology" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-ink">OptoAcademy</span>
        <nav className="flex gap-6 text-sm text-slate">
          <Link href="/dashboard" className="text-ink font-medium">Dashboard</Link>
          <Link href="/practice/1">Practice</Link>
          <Link href="/mock-exam">Mock exam</Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink mb-8">
          Welcome back, Hamza
        </h1>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-line rounded-md p-5">
              <p className="text-xs text-slate mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Link
            href="/mock-exam/new"
            className="bg-ink text-paper px-6 py-3 rounded-sm font-medium"
          >
            Start a timed mock exam
          </Link>
          <Link
            href="/practice/1"
            className="border border-line px-6 py-3 rounded-sm font-medium text-ink"
          >
            Practice by domain
          </Link>
        </div>
      </main>
    </div>
  );
}
