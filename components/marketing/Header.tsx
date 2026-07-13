"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name")
          .eq("id", data.user.id)
          .single();
        setUserName(profile?.name ?? data.user.email ?? "Account");
      }
      setCheckingAuth(false);
    }
    checkAuth();

    fetch("/api/admin/whoami")
      .then((res) => res.json())
      .then((data) => setIsAdmin(!!data.isAdmin))
      .catch(() => setIsAdmin(false));

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const navLinks = [
    { href: "/exams/dha", label: "DHA" },
    { href: "/exams/moh", label: "MOH" },
    { href: "/exams/haad", label: "HAAD" },
    { href: "/exams/schfs", label: "SCHFS" },
    { href: "/exams/omsb", label: "OMSB" },
    { href: "/exams/nhra", label: "NHRA" },
    { href: "/pricing", label: "Pricing" },
    { href: "/consultation", label: "1-on-1 Coaching" },
  ];

  return (
    <header className="border-b border-line bg-haze sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber" />
          <span className="font-semibold tracking-tight text-ink">
            OptoAcademy
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm text-slate">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink transition">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/dashboard" className="text-amber font-medium hover:text-ink transition">
              Admin panel
            </Link>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {checkingAuth ? null : userName ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-ink text-paper px-4 py-2 rounded-sm hover:bg-ink/90 transition"
            >
              {userName}
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate hover:text-ink transition">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-ink text-paper px-4 py-2 rounded-sm hover:bg-ink/90 transition"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-ink transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-ink transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-line bg-white px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm text-ink border-b border-line"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm text-amber font-medium border-b border-line"
            >
              Admin panel
            </Link>
          )}
          <div className="flex flex-col gap-2 pt-4">
            {userName ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-center font-medium bg-ink text-paper py-2.5 rounded-sm"
              >
                {userName}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-center border border-line rounded-sm py-2.5 text-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-center font-medium bg-ink text-paper py-2.5 rounded-sm"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
