import MiniHeader from "@/components/marketing/MiniHeader";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-paper">
      <MiniHeader />
      <div className="flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-white border border-line rounded-md p-8 text-center">
          <h1 className="text-xl font-semibold text-ink mb-3">Account suspended</h1>
          <p className="text-sm text-slate">
            Your account has been suspended. If you believe this is a mistake,
            please contact us at{" "}
            <a href="mailto:support@optoacademy.com" className="text-teal font-medium">
              support@optoacademy.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
