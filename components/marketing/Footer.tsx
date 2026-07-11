export default function Footer() {
  return (
    <footer className="border-t border-line mt-24 bg-haze">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate">
        <p>© {new Date().getFullYear()} OptoAcademy. Not affiliated with DHA, MOH, HAAD, or Prometric.</p>
        <div className="flex gap-6">
          <a href="/pricing" className="hover:text-ink transition">Pricing</a>
          <a href="/blog" className="hover:text-ink transition">Blog</a>
          <a href="/login" className="hover:text-ink transition">Log in</a>
        </div>
      </div>
    </footer>
  );
}
