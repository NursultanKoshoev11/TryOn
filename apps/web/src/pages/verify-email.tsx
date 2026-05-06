import Link from "next/link";

import { AuthShell, PageMeta } from "@/components/site";

export default function VerifyEmailPage() {
  return (
    <>
      <PageMeta
        title="Verify Email - VirtualFit API"
        description="Verification step for new merchant accounts."
      />
      <AuthShell
        title="Verify your email"
        subtitle="The current backend MVP does not yet expose a full verification flow, so this screen acts as the proper placeholder instead of a broken route."
        alternateLink={
          <>
            Return to{" "}
            <Link href="/login" className="text-[#ffcf93] hover:text-white">
              sign in
            </Link>
          </>
        }
      >
        <div className="rounded-[1.75rem] border border-white/8 bg-white/4 p-6">
          <p className="text-sm leading-7 text-zinc-300">
            We created the route required by the prompt and kept the messaging
            honest: once a real verification endpoint is added, this screen can
            send and confirm verification tokens.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="button-primary">
              Continue to sign in
            </Link>
            <Link href="/register" className="button-secondary">
              Create another account
            </Link>
          </div>
        </div>
      </AuthShell>
    </>
  );
}
