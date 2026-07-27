"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";

const PLAN_DETAILS: Record<string, { name: string; usd: string; pkr: string }> = {
  month1: { name: "1 Month Plan", usd: "$75", pkr: "PKR 20,000" },
  month3: { name: "3 Month Plan", usd: "$190", pkr: "PKR 50,000" },
  month6: { name: "6 Month Plan", usd: "$300", pkr: "PKR 80,000" },
};

// TODO: replace all placeholders below with real details
const WHATSAPP_NUMBER = "+92XXXXXXXXXX"; // PLACEHOLDER
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`;

const EASYPAISA_TITLE = "PLACEHOLDER — Account Title";
const EASYPAISA_NUMBER = "PLACEHOLDER — 03XXXXXXXXX";

const JAZZCASH_TITLE = "PLACEHOLDER — Account Title";
const JAZZCASH_NUMBER = "PLACEHOLDER — 03XXXXXXXXX";

const BANK_NAME = "PLACEHOLDER — Bank Name";
const BANK_TITLE = "PLACEHOLDER — Account Title";
const BANK_ACCOUNT_NUMBER = "PLACEHOLDER — Account Number";
const BANK_IBAN = "PLACEHOLDER — IBAN";

function ContactContent() {
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan");
  const plan = planSlug ? PLAN_DETAILS[planSlug] : null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-ink mb-3">Activate your subscription</h1>
      <p className="text-slate mb-10 max-w-xl">
        We don't have automated card payments yet — activation is done manually
        within 24 hours after your payment is verified.
      </p>

      {plan && (
        <div className="bg-amber/10 border border-amber/30 rounded-md p-5 mb-10">
          <p className="text-xs text-slate mb-1">Selected package</p>
          <p className="text-xl font-semibold text-ink">{plan.name}</p>
          <p className="text-sm text-slate">
            <span className="font-bold text-ink">{plan.usd}</span> · {plan.pkr} (Pakistan)
          </p>
        </div>
      )}

      {/* Step 1 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-4">Step 1 — Send payment</h2>
        <p className="text-sm text-slate mb-4">
          Transfer the amount for your selected package using any of the methods below.
        </p>

        <div className="grid gap-4">
          <div className="bg-white border border-line rounded-md p-5">
            <p className="text-sm font-semibold text-ink mb-2">Easypaisa</p>
            <p className="text-sm text-slate">Account title: {EASYPAISA_TITLE}</p>
            <p className="text-sm text-slate">Number: {EASYPAISA_NUMBER}</p>
          </div>

          <div className="bg-white border border-line rounded-md p-5">
            <p className="text-sm font-semibold text-ink mb-2">JazzCash</p>
            <p className="text-sm text-slate">Account title: {JAZZCASH_TITLE}</p>
            <p className="text-sm text-slate">Number: {JAZZCASH_NUMBER}</p>
          </div>

          <div className="bg-white border border-line rounded-md p-5">
            <p className="text-sm font-semibold text-ink mb-2">Bank transfer</p>
            <p className="text-sm text-slate">Bank: {BANK_NAME}</p>
            <p className="text-sm text-slate">Account title: {BANK_TITLE}</p>
            <p className="text-sm text-slate">Account number: {BANK_ACCOUNT_NUMBER}</p>
            <p className="text-sm text-slate">IBAN: {BANK_IBAN}</p>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-4">Step 2 — Send us the details on WhatsApp</h2>
        <p className="text-sm text-slate mb-4">
          Message us on WhatsApp with the following:
        </p>
        <ul className="text-sm text-slate space-y-2 mb-6 list-disc list-inside">
          <li>Your full name</li>
          <li>The email address you signed up with (or plan to sign up with)</li>
          <li>The package you selected</li>
          <li>A screenshot of your payment confirmation</li>
        </ul>
        
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-teal text-white px-6 py-3 rounded-sm font-medium text-sm inline-block"
        >
          Message us on WhatsApp: {WHATSAPP_NUMBER}
        </a>
      </section>

      {/* Step 3 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-4">Step 3 — Activation</h2>
        <p className="text-sm text-slate">
          Once we verify your payment, your account will be upgraded to your selected
          package within 24 hours. You'll be able to see your active plan and days
          remaining on your dashboard once it's activated.
        </p>
      </section>

      {/* Rules */}
      <section className="bg-mist border border-line rounded-md p-6">
        <h2 className="text-sm font-semibold text-ink mb-3">Important account terms</h2>
        <ul className="text-sm text-slate space-y-2 list-disc list-inside">
          <li>One account is for one person only — do not share your login with anyone else. Shared accounts may be suspended.</li>
          <li>One email address may only be used to register a single account.</li>
          <li>For the best experience taking mock exams, use a laptop or desktop computer rather than a mobile phone.</li>
          <li>Subscriptions are non-transferable between accounts or individuals.</li>
        </ul>
      </section>

      <p className="text-xs text-slate mt-10 text-center">
        Questions before paying? Message us on WhatsApp — we're happy to help.
      </p>
    </main>
  );
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="text-center py-16 text-sm text-slate">Loading...</div>}>
        <ContactContent />
      </Suspense>
      <Footer />
    </>
  );
}
