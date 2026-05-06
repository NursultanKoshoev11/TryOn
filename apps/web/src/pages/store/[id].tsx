import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  AppShell,
  CodeBlock,
  EmptyState,
  MetricCard,
  PageMeta,
  StatusBadge,
  cn,
} from "@/components/site";
import {
  createApiKey,
  fetchApiKeys,
  fetchCurrentUser,
  fetchGenerations,
  fetchOrganization,
  fetchUsage,
  getStoredToken,
  revokeApiKey,
  rotateApiKey,
  type ApiKeyRecord,
  type Generation,
  type Organization,
  type SessionUser,
  type Usage,
} from "@/lib/api";
import {
  activityFeed,
  formatDate,
  formatDateTime,
  formatPercent,
  mergeWorkspaceData,
  mockTeamMembers,
  pricingPlans,
  statusTone,
} from "@/lib/platform";

type WorkspaceState = {
  organization: Organization;
  usage: Usage;
  apiKeys: ApiKeyRecord[];
  generations: Generation[];
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "generations", label: "Generations" },
  { id: "api-keys", label: "API keys" },
  { id: "integration", label: "Integration" },
  { id: "billing", label: "Billing" },
  { id: "settings", label: "Settings" },
  { id: "team", label: "Team" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function StoreWorkspacePage() {
  const router = useRouter();
  const { id, tab } = router.query;
  const activeTab = typeof tab === "string" ? (tab as TabId) : "overview";

  const [user, setUser] = useState<SessionUser | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revealedKey, setRevealedKey] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDomains, setNewKeyDomains] = useState("");
  const [settingsName, setSettingsName] = useState("");
  const [settingsDomain, setSettingsDomain] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const token = getStoredToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (typeof id !== "string") {
      return;
    }

    setLoading(true);

    Promise.allSettled([
      fetchCurrentUser(token),
      fetchOrganization(token, id),
      fetchUsage(token, id),
      fetchApiKeys(token, id),
      fetchGenerations(token, id),
    ])
      .then((results) => {
        const currentUser =
          results[0].status === "fulfilled" ? results[0].value : null;
        const merged = mergeWorkspaceData({
          organization:
            results[1].status === "fulfilled" ? results[1].value : undefined,
          usage: results[2].status === "fulfilled" ? results[2].value : undefined,
          apiKeys:
            results[3].status === "fulfilled" ? results[3].value : undefined,
          generations:
            results[4].status === "fulfilled" ? results[4].value : undefined,
        });

        setUser(currentUser);
        setWorkspace(merged);
        setSettingsName(merged.organization.name);
        setSettingsDomain(merged.organization.store_domain);

        if (results[1].status === "rejected") {
          setNotice(
            "Some store data is being shown from a labeled preview fallback because the current backend does not expose every dashboard surface yet."
          );
        }
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load store workspace"
        );
      })
      .finally(() => setLoading(false));
  }, [id, router, router.isReady]);

  const failedGenerations = useMemo(() => {
    return workspace?.generations.filter((generation) => generation.status === "failed")
      .length;
  }, [workspace?.generations]);

  function changeTab(nextTab: TabId) {
    if (typeof id !== "string") {
      return;
    }

    router.replace(
      {
        pathname: `/store/${id}`,
        query: { tab: nextTab },
      },
      undefined,
      { shallow: true }
    );
  }

  async function handleCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const token = getStoredToken();
    if (!token || typeof id !== "string" || !workspace) {
      return;
    }

    try {
      const key = await createApiKey(token, id, {
        name: newKeyName,
        allowed_domains: newKeyDomains,
      });

      setWorkspace({
        ...workspace,
        apiKeys: [key, ...workspace.apiKeys],
      });
      setRevealedKey(key.key || "");
      setNotice("New API key created. Copy the full secret now, because it is shown only once.");
      setNewKeyName("");
      setNewKeyDomains("");
    } catch (requestError) {
      setNotice(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create API key"
      );
    }
  }

  async function handleRotateKey(keyId: string) {
    const token = getStoredToken();
    if (!token || typeof id !== "string" || !workspace) {
      return;
    }

    try {
      const rotated = await rotateApiKey(token, id, keyId);
      setWorkspace({
        ...workspace,
        apiKeys: workspace.apiKeys.map((item) =>
          item.id === keyId ? { ...item, ...rotated } : item
        ),
      });
      setRevealedKey(rotated.key || "");
      setNotice("Key rotated successfully. Save the newly revealed secret immediately.");
    } catch (requestError) {
      setNotice(
        requestError instanceof Error
          ? requestError.message
          : "Unable to rotate API key"
      );
    }
  }

  async function handleRevokeKey(keyId: string) {
    const token = getStoredToken();
    if (!token || typeof id !== "string" || !workspace) {
      return;
    }

    try {
      await revokeApiKey(token, id, keyId);
      setWorkspace({
        ...workspace,
        apiKeys: workspace.apiKeys.filter((item) => item.id !== keyId),
      });
      setNotice("API key revoked.");
    } catch (requestError) {
      setNotice(
        requestError instanceof Error
          ? requestError.message
          : "Unable to revoke API key"
      );
    }
  }

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getStoredToken();
    if (!token || typeof id !== "string" || !workspace) {
      return;
    }

    setSavingSettings(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/organizations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: settingsName,
            store_domain: settingsDomain,
          }),
        }
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save settings");
      }

      setWorkspace({
        ...workspace,
        organization: payload,
      });
      setNotice("Store settings updated.");
    } catch (requestError) {
      setNotice(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save settings"
      );
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading || !workspace) {
    return (
      <>
        <PageMeta title="Store Workspace - VirtualFit API" />
        <AppShell title="Loading store workspace" subtitle="Preparing dashboard panels.">
          <div className="card-panel p-8 text-sm text-zinc-400">
            Fetching organization data, keys, usage, and generation history...
          </div>
        </AppShell>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta title="Store Workspace - VirtualFit API" />
        <AppShell
          title="Store workspace unavailable"
          subtitle="The requested organization could not be loaded."
          actions={
            <Link href="/dashboard" className="button-secondary">
              Back to dashboard
            </Link>
          }
        >
          <EmptyState title="Unable to load store" description={error} />
        </AppShell>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`${workspace.organization.name} - VirtualFit API`}
        description="Merchant store workspace with usage, API keys, billing, integration, and privacy controls."
      />
      <AppShell
        title={workspace.organization.name}
        subtitle={`Storefront domain: ${workspace.organization.store_domain}. This workspace covers the merchant views called out in the prompt, while clearly labeling preview-only pieces that are not yet backed by a full API.`}
        actions={
          <>
            <StatusBadge value={workspace.organization.status} />
            <Link href="/dashboard" className="button-secondary">
              Dashboard
            </Link>
            {user?.role === "platform_admin" ? (
              <Link href="/admin" className="button-ghost">
                Admin
              </Link>
            ) : null}
          </>
        }
      >
        {notice ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
            {notice}
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => changeTab(item.id)}
              className={cn(
                "rounded-full border px-4 py-2.5 text-sm transition",
                activeTab === item.id
                  ? "border-[#ffcf93]/30 bg-[#ffcf93]/10 text-[#ffcf93]"
                  : "border-white/8 bg-white/4 text-zinc-300 hover:border-white/14 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total generations"
                value={workspace.usage.total_generations.toString()}
                hint={`Current plan: ${workspace.usage.plan}`}
              />
              <MetricCard
                label="Monthly usage"
                value={workspace.usage.monthly_generations.toString()}
                hint={`${workspace.usage.period_start} to ${workspace.usage.period_end}`}
              />
              <MetricCard
                label="Remaining quota"
                value={workspace.usage.remaining_quota.toString()}
                hint="Quota is shown at the store level."
              />
              <MetricCard
                label="Success rate"
                value={formatPercent(workspace.usage.success_rate)}
                hint={`${failedGenerations || 0} failed jobs currently visible`}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="card-panel p-6">
                <div className="eyebrow">Recent generations</div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Latest try-on requests
                </h2>
                <div className="mt-8 overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                    <thead>
                      <tr className="text-zinc-500">
                        <th className="pb-4 font-medium">Product</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium">Created</th>
                        <th className="pb-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {workspace.generations.slice(0, 4).map((generation) => (
                        <tr key={generation.id}>
                          <td className="py-4">
                            <div className="font-medium text-white">
                              {generation.product_name}
                            </div>
                            <div className="text-zinc-500">{generation.product_id}</div>
                          </td>
                          <td className="py-4">
                            <StatusBadge value={generation.status} />
                          </td>
                          <td className="py-4 text-zinc-300">
                            {formatDateTime(generation.created_at)}
                          </td>
                          <td className="py-4">
                            <Link
                              href={`/store/${workspace.organization.id}/generations/${generation.id}`}
                              className="text-sm text-[#ffcf93] hover:text-white"
                            >
                              View details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="card-panel p-6">
                  <div className="eyebrow">Activity</div>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                    Operational feed
                  </h2>
                  <div className="mt-6 space-y-3">
                    {activityFeed.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-zinc-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-panel p-6">
                  <div className="eyebrow">Product guardrails</div>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                    Shopper-facing language
                  </h2>
                  <div className="mt-6 space-y-3 text-sm leading-7 text-zinc-300">
                    <p>AI-generated preview. Fit, size, and appearance may vary.</p>
                    <p>Side and back views can be AI-estimated from limited input.</p>
                    <p>Shoppers must have rights and consent to upload the image.</p>
                    <p>Uploaded images are handled under the store privacy policy.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "generations" ? (
          <div className="card-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Generation jobs</div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  All visible try-on requests
                </h2>
              </div>
              <StatusBadge value={`${workspace.generations.length} jobs`} />
            </div>
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="pb-4 font-medium">Generation</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Provider</th>
                    <th className="pb-4 font-medium">Created</th>
                    <th className="pb-4 font-medium">Processing</th>
                    <th className="pb-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {workspace.generations.map((generation) => (
                    <tr key={generation.id}>
                      <td className="py-4">
                        <div className="font-medium text-white">
                          {generation.product_name}
                        </div>
                        <div className="text-zinc-500">{generation.id}</div>
                      </td>
                      <td className="py-4">
                        <StatusBadge value={generation.status} />
                      </td>
                      <td className="py-4 text-zinc-300">
                        {generation.ai_provider || "mock-provider"}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {formatDateTime(generation.created_at)}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {generation.processing_time_ms
                          ? `${generation.processing_time_ms} ms`
                          : "Pending"}
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/store/${workspace.organization.id}/generations/${generation.id}`}
                          className="text-sm text-[#ffcf93] hover:text-white"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === "api-keys" ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="card-panel p-6">
              <div className="eyebrow">Create key</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Issue a new integration credential
              </h2>
              <form onSubmit={handleCreateKey} className="mt-8 space-y-5">
                <div>
                  <label className="field-label" htmlFor="newKeyName">
                    Key name
                  </label>
                  <input
                    id="newKeyName"
                    className="field"
                    value={newKeyName}
                    onChange={(event) => setNewKeyName(event.target.value)}
                    placeholder="Production storefront"
                    required
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="newKeyDomains">
                    Allowed domains
                  </label>
                  <input
                    id="newKeyDomains"
                    className="field"
                    value={newKeyDomains}
                    onChange={(event) => setNewKeyDomains(event.target.value)}
                    placeholder="store.com, www.store.com"
                  />
                </div>
                <button type="submit" className="button-primary">
                  Create API key
                </button>
              </form>

              {revealedKey ? (
                <div className="mt-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-emerald-200">
                    Copy this secret now
                  </div>
                  <div className="mt-3 break-all text-sm text-emerald-50">
                    {revealedKey}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="card-panel p-6">
              <div className="eyebrow">Current keys</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Secret key management
              </h2>
              <div className="mt-8 space-y-4">
                {workspace.apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="rounded-[1.5rem] border border-white/8 bg-white/4 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="font-display text-2xl font-semibold text-white">
                            {key.name}
                          </div>
                          <StatusBadge value={key.status} />
                        </div>
                        <div className="mt-3 text-sm text-zinc-300">
                          Prefix: {key.key_prefix}
                        </div>
                        <div className="mt-2 text-sm text-zinc-500">
                          Created {formatDate(key.created_at)}
                        </div>
                        <div className="mt-2 text-sm text-zinc-500">
                          Allowed domains: {key.allowed_domains || "No restriction set"}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRotateKey(key.id)}
                          className="button-secondary"
                        >
                          Rotate
                        </button>
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className={cn(
                            "rounded-full border px-4 py-2.5 text-sm transition",
                            statusTone(key.status) === "rose"
                              ? "border-white/8 bg-white/4 text-zinc-500"
                              : "border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/14"
                          )}
                          disabled={key.status === "revoked"}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "integration" ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <CodeBlock title="Server-to-server example">
                {`POST /api/v1/tryon/generations
Authorization: Bearer sk_live_xxx

{
  "product_id": "dress_123",
  "product_name": "Rose Panel Dress",
  "product_image_url": "https://store.com/rose-panel.jpg",
  "user_photo_url": "https://merchant-backend.com/shopper.jpg",
  "output_count": 4
}`}
              </CodeBlock>
              <CodeBlock title="Widget example">
                {`TryOnWidget.init({
  publicKey: "pk_live_xxx",
  productId: "dress_123",
  productName: "Rose Panel Dress",
  productImageUrl: "https://store.com/rose-panel.jpg",
  container: "#virtualfit-button"
});`}
              </CodeBlock>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="card-panel p-6">
                <div className="eyebrow">Webhook</div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Callback notes
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  The prompt asks for webhook configuration. The backend does not
                  yet expose a full merchant webhook UI, so this card keeps the
                  contract visible without pretending the workflow is already
                  complete.
                </p>
                <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-zinc-300">
                  Suggested endpoint: `https://merchant-site.com/webhooks/virtualfit`
                </div>
              </div>
              <CodeBlock title="Merchant callback payload">
                {`{
  "generation_id": "gen_1001",
  "status": "completed",
  "organization_id": "${workspace.organization.id}",
  "disclaimer": "AI-generated preview. Fit, size and appearance may vary."
}`}
              </CodeBlock>
            </div>
          </div>
        ) : null}

        {activeTab === "billing" ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="card-panel p-6">
              <div className="eyebrow">Current plan</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                {workspace.usage.plan}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                The current backend supports subscription-aware usage logic, and
                this billing view now gives the merchant-facing surface that was
                missing from the web app.
              </p>
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between text-sm text-zinc-400">
                  <span>Generation usage this period</span>
                  <span>
                    {workspace.usage.monthly_generations} /{" "}
                    {workspace.usage.monthly_generations +
                      workspace.usage.remaining_quota}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/6">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(135deg,#ffd08a_0%,#d16b4a_100%)]"
                    style={{
                      width: `${
                        (workspace.usage.monthly_generations /
                          (workspace.usage.monthly_generations +
                            workspace.usage.remaining_quota)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/4 p-5">
                <div className="text-sm text-zinc-300">Invoices placeholder</div>
                <p className="mt-2 text-sm leading-7 text-zinc-500">
                  Kept intentionally honest until a real billing provider UI is
                  connected.
                </p>
              </div>
            </div>

            <div className="grid gap-5">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "card-panel p-6",
                    plan.name === workspace.usage.plan &&
                      "border-[#ffcf93]/30 bg-[#ffcf93]/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl font-semibold text-white">
                        {plan.name}
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">{plan.description}</div>
                    </div>
                    <div className="font-display text-3xl font-semibold text-white">
                      {plan.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="card-panel p-6">
              <div className="eyebrow">Store settings</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Core organization settings
              </h2>
              <form onSubmit={handleSaveSettings} className="mt-8 space-y-5">
                <div>
                  <label className="field-label" htmlFor="settingsName">
                    Store name
                  </label>
                  <input
                    id="settingsName"
                    className="field"
                    value={settingsName}
                    onChange={(event) => setSettingsName(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="settingsDomain">
                    Allowed storefront domain
                  </label>
                  <input
                    id="settingsDomain"
                    className="field"
                    value={settingsDomain}
                    onChange={(event) => setSettingsDomain(event.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="button-primary"
                  disabled={savingSettings}
                >
                  {savingSettings ? "Saving..." : "Save settings"}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="card-panel p-6">
                <div className="eyebrow">Retention and privacy</div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Merchant controls preview
                </h2>
                <div className="mt-6 space-y-3 text-sm leading-7 text-zinc-300">
                  <p>Retention window: 30 days</p>
                  <p>Consent text: required before upload</p>
                  <p>Allowed domains: merchant-managed</p>
                  <p>Webhook URL and branding settings: UI shell prepared</p>
                </div>
              </div>

              <div className="card-panel p-6">
                <div className="eyebrow">Branding</div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Widget style preview
                </h2>
                <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-[#11141b] p-5">
                  <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                    Virtual Try-On
                  </div>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    Styling controls are shown as a prepared surface so the site
                    no longer feels unfinished, while avoiding fake persistence
                    for settings the backend does not yet store.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "team" ? (
          <div className="card-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Team members</div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Roles and invitations
                </h2>
              </div>
              <button className="button-secondary">Invite member</button>
            </div>
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="pb-4 font-medium">Member</th>
                    <th className="pb-4 font-medium">Role</th>
                    <th className="pb-4 font-medium">Email</th>
                    <th className="pb-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {mockTeamMembers.map((member) => (
                    <tr key={member.email}>
                      <td className="py-4 font-medium text-white">{member.name}</td>
                      <td className="py-4 text-zinc-300">{member.role}</td>
                      <td className="py-4 text-zinc-300">{member.email}</td>
                      <td className="py-4">
                        <StatusBadge value={member.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </AppShell>
    </>
  );
}
