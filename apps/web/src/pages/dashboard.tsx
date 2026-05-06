import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import {
  AppShell,
  EmptyState,
  MetricCard,
  PageMeta,
  StatusBadge,
} from "@/components/site";
import {
  fetchCurrentUser,
  fetchOrganizations,
  getStoredToken,
  type Organization,
  type SessionUser,
} from "@/lib/api";
import { mockUsage, onboardingChecklist } from "@/lib/platform";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    Promise.all([fetchCurrentUser(token), fetchOrganizations(token)])
      .then(([currentUser, currentOrganizations]) => {
        setUser(currentUser);
        setOrganizations(currentOrganizations);
      })
      .catch((requestError) => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load workspace"
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const orgSummary = useMemo(() => {
    return {
      totalStores: organizations.length.toString(),
      monthlyUsage: organizations.length
        ? `${mockUsage.monthly_generations}`
        : "0",
      plan: organizations.length ? mockUsage.plan : "No plan yet",
    };
  }, [organizations]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  }

  if (loading) {
    return (
      <>
        <PageMeta title="Dashboard - VirtualFit API" />
        <AppShell title="Loading workspace" subtitle="Preparing merchant data.">
          <div className="card-panel p-8 text-sm text-zinc-400">
            Loading stores, permissions, and recent activity...
          </div>
        </AppShell>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        <PageMeta title="Dashboard - VirtualFit API" />
        <AppShell
          title="Workspace unavailable"
          subtitle="The session could not be restored."
          actions={
            <Link href="/login" className="button-primary">
              Sign in again
            </Link>
          }
        >
          <EmptyState
            title="Authentication issue"
            description={error}
            action={
              <Link href="/login" className="button-secondary">
                Return to login
              </Link>
            }
          />
        </AppShell>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Dashboard - VirtualFit API"
        description="Merchant dashboard for AI virtual try-on stores, API keys, and usage."
      />
      <AppShell
        title="Merchant dashboard"
        subtitle={`Welcome${user?.email ? `, ${user.email}` : ""}. Use this workspace to manage organizations, review onboarding progress, and move into deeper store-level configuration.`}
        actions={
          <>
            <Link href="/create-store" className="button-primary">
              Create store
            </Link>
            {user?.role === "platform_admin" ? (
              <Link href="/admin" className="button-secondary">
                Admin view
              </Link>
            ) : null}
            <button onClick={handleLogout} className="button-ghost">
              Sign out
            </button>
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <MetricCard
            label="Organizations"
            value={orgSummary.totalStores}
            hint="Each merchant store is isolated as its own tenant."
          />
          <MetricCard
            label="Monthly generation preview"
            value={orgSummary.monthlyUsage}
            hint="Illustrative dashboard metric until each store is opened."
          />
          <MetricCard
            label="Typical plan"
            value={orgSummary.plan}
            hint="Billing detail appears inside the store workspace."
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Your stores</div>
                <h2 className="mt-3 font-display text-3xl font-semibold">
                  Organization workspaces
                </h2>
              </div>
              <Link href="/create-store" className="button-secondary">
                New store
              </Link>
            </div>

            {organizations.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  title="No stores yet"
                  description="Create your first organization to unlock API keys, integration snippets, usage analytics, and privacy controls."
                  action={
                    <Link href="/create-store" className="button-primary">
                      Create first store
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {organizations.map((organization) => (
                  <Link
                    key={organization.id}
                    href={`/store/${organization.id}`}
                    className="rounded-[1.75rem] border border-white/8 bg-white/4 p-5 transition hover:border-white/16 hover:bg-white/6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-white">
                          {organization.name}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-400">
                          {organization.store_domain}
                        </p>
                      </div>
                      <StatusBadge value={organization.status} />
                    </div>
                    <p className="mt-5 text-sm leading-7 text-zinc-400">
                      Open the workspace to manage API keys, see generation
                      history, update domain settings, and review billing
                      placeholders.
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card-panel p-6">
              <div className="eyebrow">Onboarding</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Merchant setup checklist
              </h2>
              <div className="mt-6 space-y-3">
                {onboardingChecklist.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-zinc-300"
                  >
                    <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-xs text-zinc-400">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-panel p-6">
              <div className="eyebrow">Current role</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                {user?.role || "merchant_owner"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                The current backend exposes merchant and admin permission paths.
                This dashboard now gives those roles a much clearer entry point.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
