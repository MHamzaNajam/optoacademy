"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        mobile_number: mobileNumber,
        institute_name: instituteName,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mist px-6 py-10">
      <div className="w-full max-w-sm bg-white border border-line rounded-md p-8">
        <h1 className="text-xl font-semibold text-ink mb-1">Create your account</h1>
        <p className="text-sm text-slate mb-6">
          Start with free practice questions, no card required.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
          <input
            type="tel"
            placeholder="Mobile number"
            required
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Institute name"
            required
            value={instituteName}
            onChange={(e) => setInstituteName(e.target.value)}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-slate mt-6 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-teal font-medium">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
