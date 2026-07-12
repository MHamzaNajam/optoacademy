"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import InactivityLogout from "@/components/InactivityLogout";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("name, is_suspended")
        .eq("id", data.user.id)
        .single();

      if (profile?.is_suspended) {
        await supabase.auth.signOut();
        router.push("/suspended");
        return;
      }

      setUserName(profile?.name ?? data.user.email ?? "there");
      setLoading(false);
    }
    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-sm text-slate">Loading...</p>
      </div>
    );
  }

  const stats = [
    { label: "Mock exams taken", value: "0" },
    { label: "Average score", value: "—" },
    { label: "Weakest domain", value: "—" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <InactivityLogout />
      <header className="border-b border-line bg-haze px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="font-semibold tracking-tight text-ink">OptoAcademy</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate">
            <span className="text-ink font-medium">Dashboard</span>
            <Link href="/practice/1">Practice</Link>
            <Link href="/mock-exam">Mock exam</Link>
            <span className="text-slate/60">{userName}</span>
            <button
              onClick={handleLogout}
              className="border border-line bg-white px-3 py-1.5 rounded-sm text-ink hover:border-slate transition"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink mb-8">Welcome back, {userName}</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-line rounded-md p-5">
              <p className="text-xs text-slate mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Link href="/mock-exam/new" className="bg-ink text-paper px-6 py-3 rounded-sm font-medium">
            Start a timed mock exam
          </Link>
          <Link href="/practice/1" className="border border-line px-6 py-3 rounded-sm font-medium text-ink">
            Practice by domain
          </Link>
        </div>
      </main>
    </div>
  );
}
