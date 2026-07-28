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

const WHATSAPP_NUMBER = "+92 317 4297669";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`;
const CONTACT_EMAIL = "optoacadmy1@gmail.com";

const ACCOUNT_TITLE = "RUBAB YASEEN";
const ACCOUNT_NUMBER = "11257900818703";
const BANK_NAME = "HBL";
const BANK_IBAN = "PK58HABB0011257900818703";

function ContactContent() {
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan");
  const plan = planSlug ? PLAN_DETAILS[planSlug] : null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-ink mb-3">Activate your subscription</h1>
      <p className="text-slate mb-10 max-w-xl">
        Your account will be activated manually within 24 hours after your payment is verified.
      </p>

      {plan && (
        <div className="bg-amber/10 border border-amber/30 rounded-md p-5 mb-10">
          <p className="text-xs text-slate mb-1">Selected package</p>
          <p className="text-xl font-semibold text-ink">{plan.name}</p>
          <p className="text-sm text-slate"><span className="font-bold text-ink">{plan.usd}</span> · {plan.pkr} (Pakistan)</p>
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-4">Step 1 — Send payment</h2>
        <p className="text-sm text-slate mb-4">
          Transfer the amount for your selected package to the account below,
          using whichever method is easiest for you — Easypaisa, JazzCash, or
          direct bank transfer.
        </p>

        <div className="bg-white border border-line rounded-md p-5 flex flex-col gap-1.5">
          <p className="text-sm text-slate">Account title: <span className="text-ink font-medium">{ACCOUNT_TITLE}</span></p>
          <p className="text-sm text-slate">Account number: <span className="text-ink font-medium">{ACCOUNT_NUMBER}</span></p>
          <p className="text-sm text-slate">Bank: <span className="text-ink font-medium">{BANK_NAME}</span></p>
          <p className="text-sm text-slate">IBAN (for bank transfer): <span className="text-ink font-medium">{BANK_IBAN}</span></p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-4">Step 2 — Send us the details</h2>
        <p className="text-sm text-slate mb-4">
          Reach out via WhatsApp at <span className="font-bold text-ink">{WHATSAPP_NUMBER}</span> or by email with the following:
        </p>
        <ul className="text-sm text-slate space-y-2 mb-6 list-disc list-inside">
          <li>Your full name</li>
          <li>The email address you signed up with (or plan to sign up with)</li>
          <li>The package you selected</li>
          <li>A screenshot of your payment confirmation</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="bg-teal text-white px-6 py-3 rounded-sm font-medium text-sm inline-block text-center">Message us on WhatsApp: {WHATSAPP_NUMBER}</a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="border border-line px-6 py-3 rounded-sm font-medium text-sm inline-block text-center text-ink">Email us: {CONTACT_EMAIL}</a>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-4">Step 3 — Activation</h2>
        <p className="text-sm text-slate">
          Once we verify your payment, your account will be upgraded to your selected
          package within 24 hours. You'll be able to see your active plan and days
          remaining on your dashboard once it's activated.
        </p>
      </section>

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
        Questions before paying? Message us on WhatsApp or email — we're happy to help.
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
