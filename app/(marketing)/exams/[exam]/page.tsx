import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";

const EXAM_INFO: Record<string, { name: string; body: string; blueprint: string[] }> = {
  dha: {
    name: "DHA",
    body: "Dubai Health Authority licensing exam for optometrists relocating to work in Dubai.",
    blueprint: ["Ocular anatomy & physiology", "Refraction & optics", "Ocular disease & pathology", "Contact lenses", "Pharmacology", "Ethics & regulations"],
  },
  moh: {
    name: "MOH",
    body: "Ministry of Health and Prevention licensing exam covering the wider UAE.",
    blueprint: ["General optometry practice", "Clinical procedures", "Ocular disease", "Low vision", "UAE health regulations"],
  },
  haad: {
    name: "HAAD",
    body: "Health Authority Abu Dhabi licensing exam for practicing in the Abu Dhabi emirate.",
    blueprint: ["Clinical optometry", "Ocular pharmacology", "Patient management", "Abu Dhabi healthcare regulations"],
  },
};

export default function ExamPage({ params }: { params: { exam: string } }) {
  const info = EXAM_INFO[params.exam] ?? EXAM_INFO.dha;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-amber font-mono text-sm mb-3">{info.name} EXAM PREP</p>
        <h1 className="text-3xl font-semibold text-ink mb-4">{info.name} licensing exam for optometrists</h1>
        <p className="text-slate mb-10 max-w-xl">{info.body}</p>

        <h2 className="font-semibold text-ink mb-4">Exam blueprint</h2>
        <ul className="grid md:grid-cols-2 gap-3 mb-10">
          {info.blueprint.map((b) => (
            <li key={b} className="border border-line bg-white rounded-sm px-4 py-3 text-sm text-ink">
              {b}
            </li>
          ))}
        </ul>

        <a href="/signup" className="bg-ink text-paper px-6 py-3 rounded-sm font-medium inline-block">
          Start free {info.name} practice
        </a>
      </main>
      <Footer />
    </>
  );
}
