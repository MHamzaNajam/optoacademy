"use client";

import { useState } from "react";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import { supabase } from "@/lib/supabaseClient";

export default function ConsultationPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [examType, setExamType] = useState("DHA");
  const [wantsDocs, setWantsDocs] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("consultation_inquiries").insert({
      name,
      email,
      phone,
      exam_type: examType,
      wants_document_processing: wantsDocs,
      message,
    });

    if (insertError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-amber font-mono text-sm mb-4 tracking-wide">
            ONE-ON-ONE COACHING
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ink leading-tight mb-6 max-w-3xl mx-auto">
            Personal guidance from licensed optometrists who've been through the exam themselves
          </h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            Not just a question bank — a dedicated expert who tracks your progress,
            tells you honestly when you're ready, and guides you through every step
            until you're licensed.
          </p>
        </section>

        {/* Pricing */}
<section className="max-w-3xl mx-auto px-6 pb-16">
  <div className="bg-white border border-line rounded-md p-8 text-center">
    <p className="text-sm text-slate mb-2">One-on-one coaching</p>
    <p className="text-4xl font-bold text-ink mb-1">$550</p>
    <p className="text-sm text-slate mb-6">PKR 150,000 (Pakistan)</p>

    <div className="border-2 border-amber rounded-md p-5 bg-amber/5">
      <span className="text-xs font-semibold bg-amber text-white px-3 py-1 rounded-sm">
        LIMITED TIME — PAKISTAN OFFER
      </span>
      <p className="text-2xl font-bold text-ink mt-3">PKR 100,000</p>
      <p className="text-xs text-slate mt-1">
        Special introductory pricing for Pakistan-based candidates. Standard pricing applies afterward.
      </p>
    </div>
  </div>
</section>
        
        {/* What's included */}
        <section className="bg-haze py-16">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <div>
              <p className="font-mono text-amber text-sm mb-2">01</p>
              <h3 className="font-semibold text-ink mb-2">Personal progress tracking</h3>
              <p className="text-slate text-sm leading-relaxed">
                Your dedicated DHA-licensed expert reviews every mock exam result
                with you, tracking real improvement over time — not just a score.
              </p>
            </div>
            <div>
              <p className="font-mono text-amber text-sm mb-2">02</p>
              <h3 className="font-semibold text-ink mb-2">An honest readiness call</h3>
              <p className="text-slate text-sm leading-relaxed">
                We tell you plainly when your scores show you're ready to sit the
                real exam — and just as plainly when you're not yet, and why.
              </p>
            </div>
            <div>
              <p className="font-mono text-amber text-sm mb-2">03</p>
              <h3 className="font-semibold text-ink mb-2">Licensed expert guidance</h3>
              <p className="text-slate text-sm leading-relaxed">
                Work directly with optometrists who hold active DHA licenses and
                have sat the same exam you're preparing for.
              </p>
            </div>
          </div>
        </section>

        {/* Document processing add-on */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <div className="border-2 border-amber rounded-md p-8 bg-white">
            <span className="text-xs font-medium bg-amber/10 text-amber px-3 py-1 rounded-sm">
              Optional add-on
            </span>
            <h2 className="text-2xl font-semibold text-ink mt-4 mb-3">
              Application & documentation processing
            </h2>
            <p className="text-slate mb-4 leading-relaxed">
              Beyond exam prep, our licensed experts can personally handle your
              DHA/MOH/HAAD application and Dataflow documentation — reviewing every
              form for errors before submission, since a rejected application costs
              real time and money to resubmit.
            </p>
            <p className="text-sm text-slate">
              Priced separately from coaching — details discussed directly with your
              assigned expert based on your specific licensing pathway.
            </p>
          </div>
        </section>

        {/* Inquiry form */}
        <section className="max-w-xl mx-auto px-6 pb-24">
          <div className="bg-white border border-line rounded-md p-8">
            <h2 className="text-xl font-semibold text-ink mb-1">Get started</h2>
            <p className="text-sm text-slate mb-6">
              Tell us a bit about your goals, and your assigned expert will reach out.
            </p>

            {submitted ? (
              <p className="text-sm text-teal bg-teal/5 border border-teal/20 rounded-sm px-4 py-4">
                Thank you — we've received your details. Your assigned expert will
                reach out within 1-2 business days.
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
                <input
                  type="tel"
                  placeholder="Phone (with country code)"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-line rounded-sm px-3 py-2 text-sm"
                />
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="border border-line rounded-sm px-3 py-2 text-sm bg-white"
                >
                  <option value="DHA">DHA</option>
                  <option value="MOH">MOH</option>
                  <option value="HAAD">HAAD</option>
                  <option value="SCHFS">SCHFS</option>
                  <option value="OMSB">OMSB</option>
                  <option value="NHRA">NHRA</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-slate">
                  <input
                    type="checkbox"
                    checked={wantsDocs}
                    onChange={(e) => setWantsDocs(e.target.checked)}
                  />
                  I'm also interested in application & documentation processing
                </label>

                <textarea
                  placeholder="Anything else you'd like us to know? (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
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
                  {loading ? "Submitting..." : "Request consultation"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
