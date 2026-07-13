export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper gap-4">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-amber animate-ping absolute" />
        <span className="w-3 h-3 rounded-full bg-amber relative" />
        <span className="font-semibold tracking-tight text-ink text-lg">
          OptoAcademy
        </span>
      </div>
      {message && <p className="text-sm text-slate">{message}</p>}
    </div>
  );
}
