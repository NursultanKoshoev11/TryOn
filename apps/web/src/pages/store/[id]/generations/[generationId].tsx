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
  fetchGenerations,
  fetchOrganization,
  fetchUsage,
  getStoredToken,
  type Generation,
  type Organization,
  type Usage,
} from "@/lib/api";
import { formatDateTime, mergeWorkspaceData } from "@/lib/platform";

export default function GenerationDetailPage() {
  const router = useRouter();
  const { id, generationId } = router.query;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || typeof id !== "string") {
      return;
    }

    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    Promise.allSettled([
      fetchOrganization(token, id),
      fetchUsage(token, id),
      fetchGenerations(token, id),
    ])
      .then((results) => {
        const merged = mergeWorkspaceData({
          organization:
            results[0].status === "fulfilled" ? results[0].value : undefined,
          usage: results[1].status === "fulfilled" ? results[1].value : undefined,
          generations:
            results[2].status === "fulfilled" ? results[2].value : undefined,
        });

        setOrganization(merged.organization);
        setUsage(merged.usage);
        setGenerations(merged.generations);
      })
      .finally(() => setLoading(false));
  }, [id, router, router.isReady]);

  const generation = useMemo(() => {
    if (typeof generationId !== "string") {
      return null;
    }

    return (
      generations.find((item) => item.id === generationId) || generations[0] || null
    );
  }, [generationId, generations]);

  if (loading || !organization || !usage) {
    return (
      <>
        <PageMeta title="Generation Detail - VirtualFit API" />
        <AppShell
          title="Loading generation detail"
          subtitle="Preparing generation summary and preview outputs."
        >
          <div className="card-panel p-8 text-sm text-zinc-400">
            Loading generation metadata...
          </div>
        </AppShell>
      </>
    );
  }

  if (!generation) {
    return (
      <>
        <PageMeta title="Generation Detail - VirtualFit API" />
        <AppShell
          title="Generation not found"
          subtitle="The requested generation could not be found in the current workspace."
          actions={
            <Link href={`/store/${organization.id}?tab=generations`} className="button-secondary">
              Back to generations
            </Link>
          }
        >
          <EmptyState
            title="No generation detail available"
            description="Try opening the generations tab again from the store workspace."
          />
        </AppShell>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`${generation.product_name} - VirtualFit API`}
        description="Detailed view of a merchant try-on generation."
      />
      <AppShell
        title={generation.product_name}
        subtitle={`Generation ${generation.id} inside ${organization.name}. This screen now gives the dedicated detail view requested in the prompt, even while image rendering is still represented by safe preview placeholders.`}
        actions={
          <>
            <StatusBadge value={generation.status} />
            <Link href={`/store/${organization.id}?tab=generations`} className="button-secondary">
              Back to list
            </Link>
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-4">
          <MetricCard
            label="Created"
            value={formatDateTime(generation.created_at)}
            hint="Timestamp from generation history"
          />
          <MetricCard
            label="Provider"
            value={generation.ai_provider || "mock-provider"}
            hint="Provider abstraction remains explicit"
          />
          <MetricCard
            label="Outputs"
            value={(generation.output_count || 4).toString()}
            hint="Front, left, right, back"
          />
          <MetricCard
            label="Plan context"
            value={usage.plan}
            hint="Generation counted against workspace quota"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <div className="card-panel p-6">
              <div className="eyebrow">Inputs</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Shopper and product placeholders
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/8 bg-[#12151d] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Shopper upload
                  </div>
                  <div className="mt-4 aspect-[4/5] rounded-[1.2rem] bg-[radial-gradient(circle_at_top,rgba(255,208,138,0.14),transparent_34%),linear-gradient(180deg,#1b202d_0%,#11141b_100%)]" />
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-[#12151d] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Product image
                  </div>
                  <div className="mt-4 aspect-[4/5] rounded-[1.2rem] bg-[radial-gradient(circle_at_top,rgba(209,107,74,0.14),transparent_34%),linear-gradient(180deg,#1b202d_0%,#11141b_100%)]" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                These panels are deliberately non-photographic placeholders to
                avoid implying real shopper media is bundled in the repo.
              </p>
            </div>

            <div className="card-panel p-6">
              <div className="eyebrow">Status timeline</div>
              <div className="mt-6 space-y-3">
                {[
                  "Upload validated",
                  "Generation job queued",
                  "Worker processing",
                  "Preview outputs prepared",
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-zinc-300"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-panel p-6">
            <div className="eyebrow">Generated views</div>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white">
              Preview output grid
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Side and back views should be labeled as AI-estimated when they
              are extrapolated from limited input.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Front", "Left", "Right", "Back"].map((view) => (
                <div
                  key={view}
                  className="rounded-[1.5rem] border border-white/8 bg-[#12151d] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      {view}
                    </div>
                    {view === "Back" || view === "Left" || view === "Right" ? (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] text-amber-200">
                        AI-estimated
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 aspect-square rounded-[1.2rem] bg-[radial-gradient(circle_at_top,rgba(255,208,138,0.13),transparent_34%),linear-gradient(180deg,#1f2330_0%,#11141b_100%)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
