"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MiniHeader from "@/components/marketing/MiniHeader";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-paper">
      <MiniHeader />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-white border border-line rounded-md p-8">
          <h1 className="text-xl font-semibold text-ink mb-1">Set a new password</h1>
          <p className="text-sm text-slate mb-6">
            Choose a new password for your account.
          </p>

          {success ? (
            <p className="text-sm text-teal bg-teal/5 border border-teal/20 rounded-sm px-3 py-3">
              Password updated. Redirecting you to your dashboard...
            </p>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="New password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-line rounded-sm px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-line rounded-sm px-3 py-2 text-sm"
              />

              {error && (
                <p className="text-xs text-[#c0392b] bg-[#c0392b]/5 border border-[#c0392b]/20 rounded-sm px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-ink text-paper py-2.5 rounded-sm font-medium text-sm mt-2 disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
