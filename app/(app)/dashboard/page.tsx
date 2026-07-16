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
  const [examsTaken, setExamsTaken] = useState(0);
  const [averageScore, setAverageScore] = useState<string>("—");
  const [weakestDomain, setWeakestDomain] = useState<string>("—");

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

      const { data: attempts } = await supabase
        .from("attempts")
        .select("id, score")
        .eq("user_id", data.user.id)
        .not("submitted_at", "is", null);

      if (attempts && attempts.length > 0) {
        setExamsTaken(attempts.length);

        const avg =
          attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / attempts.length;
        setAverageScore(`${Math.round(avg)}%`);

        const attemptIds = attempts.map((a) => a.id);
        const { data: answers } = await supabase
          .from("answers")
          .select("selected, questions(correct_option, domain_id, domains(name))")
          .in("attempt_id", attemptIds);

        const domainStats: Record<string, { name: string; correct: number; total: number }> = {};

        (answers ?? []).forEach((a: any) => {
          const domainId = a.questions?.domain_id;
          const domainName = a.questions?.domains?.name ?? "Unknown";
          if (!domainId) return;
          if (!domainStats[domainId]) {
            domainStats[domainId] = { name: domainName, correct: 0, total: 0 };
          }
          domainStats[domainId].total += 1;
          if (a.selected && a.selected === a.questions?.correct_option) {
            domainStats[domainId].correct += 1;
          }
        });

        const domainList = Object.values(domainStats).map((d) => ({
          ...d,
          percentage: d.total > 0 ? (d.correct / d.total) * 100 : 0,
        }));

        if (domainList.length > 0) {
          const weakest = domainList.sort((a, b) => a.percentage - b.percentage)[0];
          setWeakestDomain(`${weakest.name} (${Math.round(weakest.percentage)}%)`);
        }
      }

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
    { label: "Mock exams taken", value: String(examsTaken) },
    { label: "Average score", value: averageScore },
    { label: "Weakest domain", value: weakestDomain },
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
            <Link href="/practice">Practice</Link>
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
          <Link href="/mock-exam" className="bg-ink text-paper px-6 py-3 rounded-sm font-medium">
            Start a timed mock exam
          </Link>
          <Link href="/practice" className="border border-line px-6 py-3 rounded-sm font-medium text-ink">
            Practice by domain
          </Link>
        </div>
      </main>
    </div>
  );
}
