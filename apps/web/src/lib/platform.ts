import type { ApiKeyRecord, Generation, Organization, Usage } from "@/lib/api";

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  badge?: string;
  features: string[];
};

export type TeamMember = {
  name: string;
  role: string;
  email: string;
  status: string;
};

export type AdminTenant = {
  name: string;
  plan: string;
  status: string;
  usage: string;
  risk: string;
};

export const trustSignals = [
  "ModeHaus",
  "Northline Atelier",
  "Velour Cart",
  "Sora Studio",
  "Atlas Apparel",
  "Threadline",
];

export const featureCards = [
  {
    title: "Virtual fitting that respects uncertainty",
    description:
      "Show four generated views, but label side and back angles as AI-estimated previews when they are inferred from limited input.",
  },
  {
    title: "API-first merchant workflow",
    description:
      "Stores can create organizations, manage keys, configure domains, and wire the widget into product pages without mixing business logic into the storefront.",
  },
  {
    title: "Privacy-forward processing",
    description:
      "Consent gates, retention controls, signed access patterns, and deletion pathways are part of the product narrative, not an afterthought.",
  },
  {
    title: "Operational visibility",
    description:
      "Usage, failures, quota pressure, and plan state are surfaced in a merchant dashboard built for real B2B workflows.",
  },
  {
    title: "Provider abstraction",
    description:
      "Generation jobs stay decoupled from a single AI vendor so the backend can evolve without rewriting the merchant experience.",
  },
  {
    title: "Widget and server modes",
    description:
      "Support both server-to-server integrations and public widget sessions with domain-restricted tokens.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$79",
    description: "For a single store validating demand.",
    features: [
      "1 storefront workspace",
      "600 try-on generations / month",
      "1 production API key",
      "30-day shopper image retention",
    ],
  },
  {
    name: "Growth",
    price: "$249",
    description: "For teams shipping weekly and watching ROI closely.",
    badge: "Popular",
    features: [
      "3 storefront workspaces",
      "4,000 try-on generations / month",
      "Widget session tokens",
      "Webhook callbacks and analytics",
    ],
  },
  {
    name: "Scale",
    price: "$699",
    description: "For brands operating multiple catalogs and regions.",
    features: [
      "10 storefront workspaces",
      "20,000 try-on generations / month",
      "Branding controls",
      "Advanced retention and audit visibility",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For high-volume merchants with compliance requirements.",
    features: [
      "Custom tenancy model",
      "Dedicated onboarding",
      "SLA and security review",
      "Private deployment options",
    ],
  },
];

export const faqItems = [
  {
    question: "Does the platform claim exact fit accuracy?",
    answer:
      "No. The experience is framed as an AI-generated preview and explicitly calls out that fit, size, and fabric behavior may differ in real life.",
  },
  {
    question: "Can a merchant embed the widget without exposing a secret key?",
    answer:
      "Yes. The recommended path is a restricted public widget token tied to allowed domains, with secret API keys reserved for server-to-server requests.",
  },
  {
    question: "What happens to shopper photos?",
    answer:
      "The product language and dashboard both center retention policy, deletion workflows, and minimal storage so merchants can run a privacy-first rollout.",
  },
  {
    question: "Is the current implementation using a real AI provider?",
    answer:
      "The architecture is ready for provider abstraction, while mocked or placeholder pieces should be labeled clearly until a production provider is connected.",
  },
];

export const mockUsage: Usage = {
  total_generations: 1842,
  monthly_generations: 412,
  remaining_quota: 3588,
  success_rate: 96.8,
  plan: "Growth",
  period_start: "2026-05-01",
  period_end: "2026-05-31",
};

export const mockOrganization: Organization = {
  id: "demo-store",
  name: "Northline Atelier",
  store_domain: "northlineatelier.com",
  status: "active",
};

export const mockGenerations: Generation[] = [
  {
    id: "gen_1001",
    product_id: "dress_rose_01",
    product_name: "Rose Panel Dress",
    status: "completed",
    created_at: "2026-05-06T09:10:00.000Z",
    output_count: 4,
    ai_provider: "mock-provider",
    processing_time_ms: 18400,
  },
  {
    id: "gen_1002",
    product_id: "jacket_cinder_08",
    product_name: "Cinder Utility Jacket",
    status: "processing",
    created_at: "2026-05-05T17:40:00.000Z",
    output_count: 4,
    ai_provider: "mock-provider",
    processing_time_ms: null,
  },
  {
    id: "gen_1003",
    product_id: "set_coast_11",
    product_name: "Coast Linen Set",
    status: "failed",
    created_at: "2026-05-05T11:12:00.000Z",
    output_count: 4,
    ai_provider: "mock-provider",
    processing_time_ms: 7200,
    error_message: "Product image source expired before processing completed.",
  },
  {
    id: "gen_1004",
    product_id: "coat_amber_02",
    product_name: "Amber Long Coat",
    status: "queued",
    created_at: "2026-05-04T08:08:00.000Z",
    output_count: 4,
    ai_provider: "mock-provider",
    processing_time_ms: null,
  },
];

export const mockApiKeys: ApiKeyRecord[] = [
  {
    id: "key_prod_01",
    name: "Production Storefront",
    key_prefix: "sk_live_nort",
    status: "active",
    allowed_domains: "northlineatelier.com, www.northlineatelier.com",
    created_at: "2026-04-12T10:30:00.000Z",
    last_used_at: "2026-05-06T08:50:00.000Z",
  },
  {
    id: "key_stage_02",
    name: "Staging QA",
    key_prefix: "sk_test_nort",
    status: "active",
    allowed_domains: "staging.northlineatelier.com",
    created_at: "2026-04-14T14:45:00.000Z",
    last_used_at: "2026-05-05T16:22:00.000Z",
  },
];

export const mockTeamMembers: TeamMember[] = [
  {
    name: "Lena Ortiz",
    role: "Owner",
    email: "lena@northlineatelier.com",
    status: "Active",
  },
  {
    name: "Marco Bell",
    role: "Developer",
    email: "marco@northlineatelier.com",
    status: "Pending invite",
  },
  {
    name: "Nia Ford",
    role: "Viewer",
    email: "nia@northlineatelier.com",
    status: "Active",
  },
];

export const mockAdminTenants: AdminTenant[] = [
  {
    name: "Northline Atelier",
    plan: "Growth",
    status: "active",
    usage: "412 / 4000",
    risk: "Healthy",
  },
  {
    name: "ModeHaus",
    plan: "Scale",
    status: "active",
    usage: "14,102 / 20,000",
    risk: "Quota watch",
  },
  {
    name: "Velour Cart",
    plan: "Starter",
    status: "suspended",
    usage: "0 / 600",
    risk: "Billing hold",
  },
];

export const activityFeed = [
  "API key rotated for Production Storefront",
  "Generation gen_1002 moved from queued to processing",
  "Webhook delivery retried for Rose Panel Dress",
  "Shopper image retention policy updated to 30 days",
];

export const onboardingChecklist = [
  "Create your merchant organization",
  "Add the production storefront domain",
  "Choose an initial plan",
  "Generate a secret API key or widget token",
  "Add privacy copy and consent language to the widget",
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function statusTone(status: string) {
  switch (status) {
    case "completed":
    case "active":
    case "Healthy":
      return "emerald";
    case "processing":
    case "queued":
    case "Pending invite":
    case "Quota watch":
      return "amber";
    case "failed":
    case "suspended":
    case "Billing hold":
      return "rose";
    default:
      return "slate";
  }
}

export function mergeWorkspaceData({
  organization,
  usage,
  apiKeys,
  generations,
}: {
  organization?: Organization;
  usage?: Usage;
  apiKeys?: ApiKeyRecord[];
  generations?: Generation[];
}) {
  return {
    organization: organization || mockOrganization,
    usage: usage || mockUsage,
    apiKeys: apiKeys && apiKeys.length > 0 ? apiKeys : mockApiKeys,
    generations:
      generations && generations.length > 0 ? generations : mockGenerations,
  };
}
