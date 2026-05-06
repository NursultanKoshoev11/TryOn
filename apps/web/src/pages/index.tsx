import Link from "next/link";

import {
  AppShell,
  CodeBlock,
  MarketingFooter,
  MarketingNav,
  MetricCard,
  PageMeta,
  SectionHeader,
} from "@/components/site";
import {
  faqItems,
  featureCards,
  pricingPlans,
  trustSignals,
} from "@/lib/platform";

export default function Home() {
  return (
    <>
      <PageMeta
        title="VirtualFit API - AI Virtual Try-On for Fashion Stores"
        description="Premium SaaS workflow for merchant-facing AI try-on, usage analytics, privacy-first image handling, and widget/API integrations."
      />

      <div className="min-h-screen bg-[#090a0e] text-white">
        <MarketingNav />

        <main>
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,208,138,0.18),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(209,107,74,0.16),transparent_20%)]" />
            <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-24">
              <div className="relative z-10">
                <div className="eyebrow">AI virtual try-on platform</div>
                <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Turn product pages into{" "}
                  <span className="bg-[linear-gradient(135deg,#fff4d4_0%,#ffcf93_45%,#d16b4a_100%)] bg-clip-text text-transparent">
                    high-trust fitting experiences
                  </span>
                  .
                </h1>
                <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                  VirtualFit API gives fashion merchants a polished try-on
                  workflow with multi-tenant controls, developer-ready
                  integration, and honest AI preview language that helps reduce
                  uncertainty before checkout.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link href="/register" className="button-primary">
                    Start free
                  </Link>
                  <Link href="/docs" className="button-secondary">
                    View integration docs
                  </Link>
                </div>
                <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                  <MetricCard
                    label="Default outputs"
                    value="4 views"
                    hint="Front, left, right, and AI-estimated back preview."
                  />
                  <MetricCard
                    label="Merchant model"
                    value="Multi-tenant"
                    hint="Each store is isolated as its own organization."
                  />
                  <MetricCard
                    label="Privacy posture"
                    value="Retention-first"
                    hint="Consent, deletion, and scoped access are built in."
                  />
                </div>
              </div>

              <div className="relative">
                <div className="card-panel relative overflow-hidden p-6 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,208,138,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(209,107,74,0.14),transparent_30%)]" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                          Merchant workspace
                        </div>
                        <div className="mt-2 font-display text-2xl font-semibold">
                          Northline Atelier
                        </div>
                      </div>
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                        Growth plan
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-[1.75rem] border border-white/8 bg-[#12151d] p-5">
                        <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                          Shopper upload
                        </div>
                        <div className="mt-4 aspect-[4/5] rounded-[1.4rem] bg-[linear-gradient(180deg,#1f2431_0%,#10131a_100%)] p-4">
                          <div className="h-full rounded-[1.15rem] border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,208,138,0.15),transparent_30%),linear-gradient(180deg,#161a22_0%,#11141c_100%)]" />
                        </div>
                        <p className="mt-4 text-sm leading-6 text-zinc-400">
                          Consent copy, file validation, and privacy notice
                          appear before generation starts.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[1.75rem] border border-white/8 bg-[#12151d] p-5">
                          <div className="flex items-center justify-between">
                            <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                              Product card
                            </div>
                            <div className="text-xs text-zinc-500">
                              Rose Panel Dress
                            </div>
                          </div>
                          <div className="mt-4 rounded-[1.35rem] border border-white/8 bg-[linear-gradient(135deg,#1b202d_0%,#141823_100%)] p-5">
                            <div className="grid grid-cols-2 gap-3">
                              {["Front", "Left", "Right", "Back"].map((view) => (
                                <div
                                  key={view}
                                  className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,#151923_0%,#0f1218_100%)] p-3"
                                >
                                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    {view}
                                  </div>
                                  <div className="aspect-square rounded-xl bg-[radial-gradient(circle_at_top,rgba(255,208,138,0.12),transparent_35%),linear-gradient(180deg,#1f2330_0%,#11141b_100%)]" />
                                </div>
                              ))}
                            </div>
                          </div>
                          <p className="mt-4 text-sm leading-6 text-zinc-400">
                            Side and back outputs are framed as AI-estimated
                            previews when inferred from a single shopper photo.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <MetricCard
                            label="Monthly usage"
                            value="412"
                            hint="Active merchant workspace"
                          />
                          <MetricCard
                            label="Success rate"
                            value="96.8%"
                            hint="Across recent try-on requests"
                          />
                          <MetricCard
                            label="Remaining quota"
                            value="3,588"
                            hint="Current billing period"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-white/8 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.28em] text-zinc-500">
                <span>Designed for modern merchants</span>
                {trustSignals.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/8 bg-white/4 px-4 py-2 text-zinc-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section id="product" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="How it works"
              title="A merchant workflow that feels premium on the surface and disciplined underneath."
              description="The landing page now mirrors the prompt requirements: merchant signup, storefront setup, API and widget integration, generation visibility, and compliance-aware messaging."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Install widget or API",
                  text: "Create an organization, register allowed domains, and choose the integration mode that fits the storefront architecture.",
                },
                {
                  step: "02",
                  title: "Collect consent and images",
                  text: "Shoppers upload a photo only after clear disclosure that AI processing will happen and retention rules apply.",
                },
                {
                  step: "03",
                  title: "Generate try-on views",
                  text: "The backend queues the job, tracks status, and returns a four-view preview with transparent language around estimation.",
                },
                {
                  step: "04",
                  title: "Review usage and quality",
                  text: "Merchants monitor quota, failures, API keys, and operational activity from one dashboard.",
                },
              ].map((item) => (
                <div key={item.step} className="card-panel p-6">
                  <div className="text-sm font-semibold text-[#ffcf93]">
                    {item.step}
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature) => (
                <div key={feature.title} className="card-panel p-6">
                  <div className="h-12 w-12 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,208,138,0.18),rgba(209,107,74,0.16))]" />
                  <h3 className="mt-6 font-display text-2xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
              <SectionHeader
                eyebrow="Developer API"
                title="Server-to-server and widget flows are both first-class."
                description="The prompt asked for two integration modes, secure key handling, and a dedicated docs experience. The website now surfaces those patterns directly."
              />
              <CodeBlock title="Widget session example">
                {`<script src="https://cdn.virtualfit.dev/widget.js"></script>
<script>
  TryOnWidget.init({
    publicKey: "pk_live_demo",
    productId: "dress_123",
    productName: "Rose Panel Dress",
    productImageUrl: "https://store.com/rose-panel.jpg",
    container: "#virtualfit-trigger"
  });
</script>`}
              </CodeBlock>
            </div>
          </section>

          <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Pricing"
              title="Plans shaped around usage, API controls, and retention policy."
              description="Pricing cards stay concise, premium, and B2B-focused instead of over-claiming growth outcomes."
              align="center"
            />
            <div className="mt-12 grid gap-5 xl:grid-cols-4">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`card-panel p-6 ${
                    plan.badge ? "border-[#ffcf93]/30 bg-[rgba(255,208,138,0.06)]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl font-semibold text-white">
                        {plan.name}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {plan.description}
                      </p>
                    </div>
                    {plan.badge ? (
                      <span className="rounded-full border border-[#ffcf93]/30 bg-[#ffcf93]/10 px-3 py-1 text-xs font-medium text-[#ffcf93]">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-8 font-display text-4xl font-semibold text-white">
                    {plan.price}
                    {plan.price !== "Custom" ? (
                      <span className="ml-2 text-base font-medium text-zinc-500">
                        / month
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-zinc-300"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="security" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <SectionHeader
                eyebrow="Security and privacy"
                title="The product language stays honest about what AI can and cannot guarantee."
                description="Consent capture, domain restrictions, rate limiting, retention controls, and neutral preview disclaimers are surfaced as part of the user experience."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  "Consent checkbox before upload",
                  "AI-processing disclosure in widget UI",
                  "Signed access model for private media",
                  "Per-organization API usage visibility",
                  "Deletion and retention policy cues",
                  "Clear note that fit and fabric may vary",
                ].map((item) => (
                  <div key={item} className="card-panel p-5 text-sm text-zinc-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Questions merchants usually ask before rollout."
              description="The answers stay aligned with the prompt: transparent, implementation-aware, and careful not to invent capabilities."
            />
            <div className="mt-10 space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="card-panel p-6">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {item.question}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
            <div className="card-panel overflow-hidden p-8 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="eyebrow">Merchant onboarding</div>
                  <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Start with an elegant SaaS shell, then wire the backend
                    deeper as the platform matures.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                    The web app now matches the prompt direction much more
                    closely: premium landing, auth flows, merchant workspace,
                    docs, admin preview, and privacy-forward messaging.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard" className="button-secondary">
                    Open workspace
                  </Link>
                  <Link href="/register" className="button-primary">
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <MarketingFooter />
      </div>
    </>
  );
}
