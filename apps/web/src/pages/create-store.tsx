import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { AppShell, EmptyState, PageMeta } from "@/components/site";
import { createOrganization, getStoredToken } from "@/lib/api";

export default function CreateStorePage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: "",
    storeDomain: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace("/login");
    }
  }, [router]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);

    try {
      const organization = await createOrganization(token, {
        name: formState.name,
        store_domain: formState.storeDomain,
      });

      router.push(`/store/${organization.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to create store"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Create Store - VirtualFit API"
        description="Create a merchant organization and set its primary storefront domain."
      />
      <AppShell
        title="Create a new storefront workspace"
        subtitle="This is the first onboarding step from the prompt: create the organization, attach its primary domain, then continue with plan and API credentials."
        actions={
          <Link href="/dashboard" className="button-secondary">
            Back to dashboard
          </Link>
        }
      >
        <div className="mx-auto max-w-3xl">
          <div className="card-panel p-8">
            {error ? (
              <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="field-label" htmlFor="name">
                  Store name
                </label>
                <input
                  id="name"
                  name="name"
                  className="field"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Northline Atelier"
                  required
                />
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  This becomes the merchant workspace label inside the dashboard.
                </p>
              </div>

              <div>
                <label className="field-label" htmlFor="storeDomain">
                  Primary storefront domain
                </label>
                <input
                  id="storeDomain"
                  name="storeDomain"
                  className="field"
                  value={formState.storeDomain}
                  onChange={handleChange}
                  placeholder="northlineatelier.com"
                  required
                />
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Use the production domain that should be allowed for widget or
                  public token sessions.
                </p>
              </div>

              <button type="submit" className="button-primary" disabled={loading}>
                {loading ? "Creating storefront..." : "Create storefront"}
              </button>
            </form>
          </div>

          <div className="mt-6">
            <EmptyState
              title="Next onboarding steps"
              description="After the organization is created, the workspace guides the merchant through plan selection, API key creation, allowed domains, integration snippets, and privacy settings."
            />
          </div>
        </div>
      </AppShell>
    </>
  );
}
