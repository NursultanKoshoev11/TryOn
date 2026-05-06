import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

import { AuthShell, PageMeta } from "@/components/site";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Invalid credentials");
      }

      localStorage.setItem("access_token", payload.access_token);
      localStorage.setItem("refresh_token", payload.refresh_token);
      router.push("/dashboard");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Sign In - VirtualFit API"
        description="Access the merchant workspace for AI virtual try-on operations."
      />
      <AuthShell
        title="Sign in"
        subtitle="Use your merchant credentials to manage stores, API keys, usage, and generation history."
        alternateLink={
          <>
            No account yet?{" "}
            <Link href="/register" className="text-[#ffcf93] hover:text-white">
              Create one
            </Link>
          </>
        }
      >
        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="email">
              Work email
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
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="field-label mb-0" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                Forgot password
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Enter workspace"}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
