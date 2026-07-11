export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm bg-white border border-line rounded-md p-8">
        <h1 className="text-xl font-semibold text-ink mb-1">Create your account</h1>
        <p className="text-sm text-slate mb-6">
          Start with free practice questions, no card required.
        </p>

        <form className="flex flex-col gap-3">
          <input type="text" placeholder="Full name" className="border border-line rounded-sm px-3 py-2 text-sm" />
          <input type="email" placeholder="name@email.com" className="border border-line rounded-sm px-3 py-2 text-sm" />
          <input type="password" placeholder="Password" className="border border-line rounded-sm px-3 py-2 text-sm" />
          <button type="submit" className="bg-ink text-paper py-2.5 rounded-sm font-medium text-sm mt-2">
            Create account
          </button>
        </form>

        <p className="text-xs text-slate mt-6 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-teal font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}
