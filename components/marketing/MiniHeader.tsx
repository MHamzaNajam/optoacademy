import Link from "next/link";

export default function MiniHeader() {
  return (
    <header className="border-b border-line bg-haze px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber" />
          <span className="font-semibold tracking-tight text-ink">
            OptoAcademy
          </span>
        </Link>
        <Link href="/" className="text-sm text-slate hover:text-ink transition">
          ← Back to home
        </Link>
      </div>
    </header>
  );
}
