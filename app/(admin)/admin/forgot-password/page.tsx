"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MiniHeader from "@/components/marketing/MiniHeader";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("Something went wrong. Please try again.");
    } else {
      setMessage("If that email is registered, a reset link has been sent.");
    }
  };

  return (
    <div className="min-h-screen bg-mist">
      <MiniHeader />
      <div className="flex items-center justify-center py-16">
        <form onSubmit={handleReset} className="bg-white border border-line rounded-md p-8 w-full max-w-sm">
          <h1 className="text-lg font-semibold text-ink mb-4">Reset admin password</h1>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {message && <p className="text-teal text-sm mb-3">{message}</p>}

          <label className="block text-xs text-slate mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-sm w-full mb-3"
          />

          <button type="submit" className="bg-ink text-paper py-2.5 rounded-sm font-medium text-sm w-full">
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
}
