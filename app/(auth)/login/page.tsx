"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MiniHeader from "@/components/marketing/MiniHeader";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (searchParams.get("timeout") === "1") {
      setTimedOut(true);
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTimedOut(false);
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first, then click 'Forgot password'.");
      return;
    }
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetSent(true);
  }

  return (
    <div className="min-h-screen bg-paper">
      <MiniHeader />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-white border border-line rounded-md p-8">
          <h1 className="text-xl font-semibold text-ink mb-1">Log in</h1>
          <p className="text-sm text-slate mb-6">Welcome back to OptoAcademy.</p>

          {timedOut && (
            <p className="text-xs text-amber bg-amber/5 border border-amber/20 rounded-sm px-3 py-2 mb-3">
              You were logged out after a period of inactivity. Please log in again.
            </p>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="name@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-line rounded-sm px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-line rounded-sm px-3 py-2 text-sm"
            />

            {error && (
              <p className="text-xs text-[#c0392b] bg-[#c0392b]/5 border border-[#c0392b]/20 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            {resetSent && (
              <p className="text-xs text-teal bg-teal/5 border border-teal/20 rounded-sm px-3 py-2">
                Password reset email sent — check your inbox.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-ink text-paper py-2.5 rounded-sm font-medium text-sm mt-2 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-slate hover:text-ink transition text-center"
            >
              Forgot password?
            </button>
          </form>

          <p className="text-xs text-slate mt-6 text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-teal font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
