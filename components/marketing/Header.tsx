import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber" />
          <span className="font-semibold tracking-tight text-ink">
            OptoAcademy
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate">
          <Link href="/exams/dha" className="hover:text-ink transition">
            DHA
          </Link>
          <Link href="/exams/moh" className="hover:text-ink transition">
            MOH
          </Link>
          <Link href="/exams/haad" className="hover:text-ink transition">
            HAAD
          </Link>
          <Link href="/pricing" className="hover:text-ink transition">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate hover:text-ink transition"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-ink text-paper px-4 py-2 rounded-sm hover:bg-ink/90 transition"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
