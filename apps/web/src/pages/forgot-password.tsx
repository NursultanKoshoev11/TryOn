import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthShell, PageMeta } from "@/components/site";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <PageMeta
        title="Forgot Password - VirtualFit API"
        description="Password reset placeholder for the merchant workspace."
      />
      <AuthShell
        title="Reset password"
        subtitle="The prompt expects this page to exist. It is now present and clearly labeled while the backend reset endpoints are still pending."
        alternateLink={
          <>
            Back to{" "}
            <Link href="/login" className="text-[#ffcf93] hover:text-white">
              sign in
            </Link>
          </>
        }
      >
        {submitted ? (
          <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-6 text-sm leading-7 text-emerald-100">
            A reset flow placeholder has been prepared for {email}. When the
            backend adds `POST /api/v1/auth/forgot-password`, this screen can
            call it directly without further route changes.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="email">
                Account email
              </label>
              <input
                id="email"
                type="email"
                className="field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="team@store.com"
                required
              />
            </div>
            <button type="submit" className="button-primary w-full">
              Prepare reset flow
            </button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
