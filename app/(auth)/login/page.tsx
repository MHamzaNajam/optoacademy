import MiniHeader from "@/components/marketing/MiniHeader";
export default function LoginPage() {
     return (
       <div className="min-h-screen bg-paper">
         <MiniHeader />
         <div className="flex items-center justify-center px-6 py-16">      
        <div className="w-full max-w-sm bg-white border border-line rounded-md p-8">
        <h1 className="text-xl font-semibold text-ink mb-1">Log in</h1>
        <p className="text-sm text-slate mb-6">
          Welcome back to OptoAcademy.
        </p>

        {/* TODO: wire up to Clerk's <SignIn /> component, or your chosen auth provider */}
        <form className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="name@email.com"
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-ink text-paper py-2.5 rounded-sm font-medium text-sm mt-2"
          >
            Log in
          </button>
        </form>

        <p className="text-xs text-slate mt-6 text-center">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-teal font-medium">
            Sign up
          </a>
        </p>
         </div>
       </div>
     </div>
   );
   }
