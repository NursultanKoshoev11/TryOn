import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell, MetricCard, PageMeta, StatusBadge } from "@/components/site";
import { fetchCurrentUser, getStoredToken, type SessionUser } from "@/lib/api";
import { mockAdminTenants } from "@/lib/platform";

export default function AdminPage() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    fetchCurrentUser(token).then(setUser).catch(() => null);
  }, []);

  return (
    <>
      <PageMeta
        title="Admin Preview - VirtualFit API"
        description="Platform owner overview for organizations, usage, and risk signals."
      />
      <AppShell
        title="Platform admin overview"
        subtitle="The prompt called for an admin panel. This page now provides a dedicated, premium preview instead of leaving the capability hidden behind backend routes only."
        actions={
          <>
            <Link href="/dashboard" className="button-secondary">
              Merchant dashboard
            </Link>
            <Link href="/docs" className="button-ghost">
              View docs
            </Link>
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-4">
          <MetricCard label="Tenants" value="24" hint="Preview admin metric" />
          <MetricCard label="Active plans" value="19" hint="Paid and trial stores" />
          <MetricCard
            label="Flagged issues"
            value="3"
            hint="Billing or quota related"
          />
          <MetricCard
            label="Current role"
            value={user?.role || "preview"}
            hint="Role is read from the active session when available."
          />
        </div>

        <div className="mt-6 card-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Tenant health</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Organization watchlist
              </h2>
            </div>
            <div className="text-sm text-zinc-500">
              Backend MVP currently exposes `/api/v1/admin/organizations`
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/8 text-left text-sm">
              <thead>
                <tr className="text-zinc-500">
                  <th className="pb-4 font-medium">Tenant</th>
                  <th className="pb-4 font-medium">Plan</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Usage</th>
                  <th className="pb-4 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {mockAdminTenants.map((tenant) => (
                  <tr key={tenant.name}>
                    <td className="py-4 font-medium text-white">{tenant.name}</td>
                    <td className="py-4 text-zinc-300">{tenant.plan}</td>
                    <td className="py-4">
                      <StatusBadge value={tenant.status} />
                    </td>
                    <td className="py-4 text-zinc-300">{tenant.usage}</td>
                    <td className="py-4">
                      <StatusBadge value={tenant.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppShell>
    </>
  );
}
