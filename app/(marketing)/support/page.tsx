"use client";

import { useState } from "react";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import { supabase } from "@/lib/supabaseClient";

const WHATSAPP_NUMBER = "+92 317 4297669";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`;
const CONTACT_EMAIL = "optoacadmy1@gmail.com";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("general_inquiries").insert({
      name,
      email,
      message,
    });

    if (insertError) {
      setError("Something went wrong. Please try again, or reach us directly via WhatsApp or email above.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-ink mb-3">Contact us</h1>
        <p className="text-slate mb-10 max-w-xl">
          For urgent issues — account access, payment questions, or anything
          time-sensitive — reach us directly. For everything else, the form
          below works too.
        </p>

        <div className="bg-amber/10 border border-amber/30 rounded-md p-6 mb-10">
          <p className="text-sm font-semibold text-ink mb-3">For urgent queries, contact us directly:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="bg-teal text-white px-6 py-3 rounded-sm font-medium text-sm inline-block text-center">WhatsApp: {WHATSAPP_NUMBER}</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="border border-line bg-white px-6 py-3 rounded-sm font-medium text-sm inline-block text-center text-ink">Email: {CONTACT_EMAIL}</a>
          </div>
        </div>

        <div className="bg-white border border-line rounded-md p-6">
          <h2 className="text-lg font-semibold text-ink mb-1">Or send us a message</h2>
          <p className="text-sm text-slate mb-6">
            We typically respond within 24 hours.
          </p>

          {submitted ? (
            <p className="text-sm text-teal bg-teal/5 border border-teal/20 rounded-sm px-4 py-4">
              Thank you — we've received your message and will get back to you soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-line rounded-sm px-3 py-2 text-sm"
              />
              <textarea
                placeholder="How can we help?"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
                {loading ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
