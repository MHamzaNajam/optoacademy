import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";

const plans = [
  {
    name: "1 month",
    price: "$19",
    period: "/ month",
    features: ["Full DHA + MOH + HAAD question banks", "Unlimited mock exams", "Domain-level analytics"],
  },
  {
    name: "3 months",
    price: "$39",
    period: "/ 3 months",
    features: ["Everything in 1 month", "Best for a full prep cycle", "Priority content updates"],
    featured: true,
  },
  {
    name: "Until you pass",
    price: "$69",
    period: "one-time",
    features: ["Everything in 3 months", "No expiry until you pass", "Free re-attempts on retest"],
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-ink mb-3">Pricing</h1>
        <p className="text-slate mb-12 max-w-xl">
          Straightforward plans built around how long people actually study
          for these exams.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-md border p-6 flex flex-col ${
                plan.featured
                  ? "border-amber border-2 bg-white"
                  : "border-line bg-white"
              }`}
            >
              {plan.featured && (
                <span className="text-xs font-medium bg-amber/10 text-amber w-fit px-3 py-1 rounded-sm mb-4">
                  Most popular
                </span>
              )}
              <h2 className="font-semibold text-ink text-lg mb-1">{plan.name}</h2>
              <p className="mb-6">
                <span className="text-3xl font-semibold text-ink">{plan.price}</span>
                <span className="text-slate text-sm ml-1">{plan.period}</span>
              </p>
              <ul className="text-sm text-slate space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-teal">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="bg-ink text-paper py-2.5 rounded-sm font-medium hover:bg-ink/90 transition">
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
