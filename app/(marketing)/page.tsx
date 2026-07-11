import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <section className="pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-amber font-mono text-sm mb-4 tracking-wide">
              DHA · MOH · HAAD · SCHFS · OMSB · NHRA EXAM PREP
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-ink leading-tight mb-6">
              Sharpen your prep until
              <br />
              it&apos;s{" "}
              <span className="text-teal">20/20</span> ready.
            </h1>
            <p className="text-slate text-lg mb-8 max-w-md">
              Original mock exams built to the real DHA, MOH, HAAD, SCHFS,
              OMSB, and NHRA blueprints — timed, scored, and reviewed the
              way the real exam works.
            </p>
            <div className="flex gap-4">
              <Link
                href="/signup"
                className="bg-ink text-paper px-6 py-3 rounded-sm font-medium hover:bg-ink/90 transition"
              >
                Start free practice
              </Link>
              <Link
                href="/exams/dha"
                className="border border-line px-6 py-3 rounded-sm font-medium text-ink hover:border-slate transition"
              >
                See DHA blueprint
              </Link>
            </div>
          </div>

          {/* Snellen-chart signature element */}
          <div className="bg-ink rounded-md p-10 flex flex-col items-center justify-center gap-3 select-none">
            <p style={{ fontSize: "34px" }} className="text-paper/95 font-mono tracking-widest text-center w-full">
              DHA MOH HAAD
            </p>
            <p style={{ fontSize: "26px" }} className="text-paper/80 font-mono tracking-widest text-center w-full">
              SCHFS OMSB NHRA
            </p>
            <p style={{ fontSize: "22px" }} className="text-paper/65 font-mono tracking-widest blur-[0.4px] text-center w-full">
              MOCK EXAMS
            </p>
            <p style={{ fontSize: "16px" }} className="text-paper/45 font-mono tracking-widest blur-[1px] text-center w-full">
              SCORE REPORTS
            </p>
            <p style={{ fontSize: "12px" }} className="text-paper/30 font-mono tracking-widest blur-[1.5px] text-center w-full">
              OPTOACADEMY.COM
            </p>
          </div>
        </section>

        {/* Value props */}
        <section className="py-16 border-t border-line grid md:grid-cols-3 gap-10">
          <div>
            <p className="font-mono text-amber text-sm mb-2">01</p>
            <h3 className="font-semibold text-ink mb-2">Real exam interface</h3>
            <p className="text-slate text-sm leading-relaxed">
              Timed sections, question flagging, and a review screen that
              matches the real Prometric-delivered exam — no surprises on
              test day.
            </p>
          </div>
          <div>
            <p className="font-mono text-amber text-sm mb-2">02</p>
            <h3 className="font-semibold text-ink mb-2">Original question bank</h3>
            <p className="text-slate text-sm leading-relaxed">
              Written and reviewed by licensed optometrists against the
              official exam blueprints — with explanations, not just
              answers.
            </p>
          </div>
          <div>
            <p className="font-mono text-amber text-sm mb-2">03</p>
            <h3 className="font-semibold text-ink mb-2">Know your weak spots</h3>
            <p className="text-slate text-sm leading-relaxed">
              Domain-by-domain breakdowns after every mock exam, so your
              next study session targets exactly what needs work.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
