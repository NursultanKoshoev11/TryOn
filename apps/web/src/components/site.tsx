import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";

import { statusTone } from "@/lib/platform";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PageMeta({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#ffd08a_0%,#d16b4a_55%,#52211a_100%)] text-sm font-semibold text-zinc-950 shadow-[0_20px_50px_rgba(209,107,74,0.25)]">
        VF
      </div>
      <div>
        <div className="font-display text-lg font-semibold tracking-tight text-white">
          {compact ? "VirtualFit" : "VirtualFit API"}
        </div>
        {!compact ? (
          <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            Privacy-first try-on
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(9,10,14,0.74)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="transition hover:opacity-90">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
          <Link href="/#product" className="hover:text-white">
            Product
          </Link>
          <Link href="/#pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-white">
            Docs
          </Link>
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link className="button-ghost" href="/login">
            Sign in
          </Link>
          <Link className="button-primary" href="/register">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#090a0e]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:px-8">
        <div className="space-y-4">
          <BrandMark />
          <p className="max-w-sm text-sm leading-7 text-zinc-400">
            Merchant infrastructure for AI virtual try-on, built around tenant
            isolation, honest preview language, and API-first integration.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[
            { href: "/#product", label: "How it works" },
            { href: "/#pricing", label: "Pricing" },
            { href: "/#security", label: "Privacy" },
          ]}
        />
        <FooterColumn
          title="Developers"
          links={[
            { href: "/docs", label: "Integration docs" },
            { href: "/dashboard", label: "Workspace" },
            { href: "/admin", label: "Admin overview" },
          ]}
        />
        <FooterColumn
          title="Platform"
          links={[
            { href: "/register", label: "Create account" },
            { href: "/login", label: "Merchant login" },
            { href: "/forgot-password", label: "Reset password" },
          ]}
        />
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </h3>
      <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-300">
        {links.map((item) => (
          <Link key={item.label} href={item.href} className="hover:text-white">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "text-center")}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090a0e] text-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(209,107,74,0.22),transparent_42%),radial-gradient(circle_at_20%_20%,rgba(255,208,138,0.1),transparent_22%)]" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-white/8 bg-white/4 p-6 shadow-[0_32px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
          <div>
            <BrandMark compact />
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  alternateLink,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  alternateLink?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090a0e] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-panel relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,208,138,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(209,107,74,0.16),transparent_32%)]" />
          <div className="relative">
            <BrandMark />
            <div className="mt-10 max-w-xl">
              <div className="eyebrow">Merchant platform</div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                AI try-on infrastructure for modern fashion stores.
              </h1>
              <p className="mt-6 text-base leading-8 text-zinc-300">
                Build a shopper-facing preview flow, protect private images,
                and keep usage, keys, and quota controls inside one SaaS
                workspace.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <InfoStrip label="Widget modes" value="Public token or server-side" />
              <InfoStrip label="Default outputs" value="4-view preview" />
              <InfoStrip label="Privacy language" value="Built into UX copy" />
              <InfoStrip label="Tenant model" value="One store = one organization" />
            </div>
          </div>
        </div>
        <div className="card-panel flex items-center p-8 sm:p-10">
          <div className="w-full">
            <div className="eyebrow">Access workspace</div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {alternateLink ? (
              <div className="mt-6 text-sm text-zinc-400">{alternateLink}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </div>
      <div className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      {hint ? <p className="mt-3 text-sm text-zinc-400">{hint}</p> : null}
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const tone = statusTone(value);

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize tracking-wide",
        tone === "emerald" &&
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
        tone === "amber" &&
          "border-amber-400/20 bg-amber-400/10 text-amber-200",
        tone === "rose" && "border-rose-400/20 bg-rose-400/10 text-rose-200",
        tone === "slate" &&
          "border-white/10 bg-white/6 text-zinc-300"
      )}
    >
      {value}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/14 bg-white/[0.03] p-8 text-center">
      <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-400">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function CodeBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-[#0d0f15]">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="text-sm font-medium text-zinc-200">{title}</div>
        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffb36a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d16b4a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        </div>
      </div>
      <pre className="overflow-x-auto px-5 py-5 text-sm leading-7 text-zinc-300">
        <code>{children}</code>
      </pre>
    </div>
  );
}
