import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-amber font-mono text-sm mb-3">COMING SOON</p>
        <h1 className="text-3xl font-semibold text-ink mb-4">
          The OptoAcademy blog is on its way
        </h1>
        <p className="text-slate">
          Exam guides, blueprint breakdowns, and prep tips for DHA, MOH, and
          HAAD candidates — launching soon.
        </p>
      </main>
      <Footer />
    </>
  );
}
