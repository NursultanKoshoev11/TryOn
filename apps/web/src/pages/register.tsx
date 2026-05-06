import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useState } from "react";

import { AuthShell, PageMeta } from "@/components/site";
import { API_URL } from "@/lib/api";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
          full_name: formState.fullName,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Registration failed");
      }

      router.push("/verify-email");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Create Account - VirtualFit API"
        description="Create a merchant account for the VirtualFit API workspace."
      />
      <AuthShell
        title="Create account"
        subtitle="Start with a merchant workspace, then create your store, choose a plan, and generate integration credentials."
        alternateLink={
          <>
            Already have access?{" "}
            <Link href="/login" className="text-[#ffcf93] hover:text-white">
              Sign in
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
            <label className="field-label" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              className="field"
              value={formState.fullName}
              onChange={handleChange}
              placeholder="Lena Ortiz"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="field"
              value={formState.email}
              onChange={handleChange}
              placeholder="team@store.com"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="field"
              value={formState.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="field"
              value={formState.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat the password"
              required
            />
          </div>
          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create merchant account"}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
