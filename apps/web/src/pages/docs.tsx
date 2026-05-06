import Link from "next/link";

import {
  CodeBlock,
  MarketingFooter,
  MarketingNav,
  PageMeta,
  SectionHeader,
} from "@/components/site";

export default function DocsPage() {
  return (
    <>
      <PageMeta
        title="Integration Docs - VirtualFit API"
        description="Developer docs for server-to-server and widget-based AI try-on integrations."
      />
      <div className="min-h-screen bg-[#090a0e] text-white">
        <MarketingNav />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Integration docs"
            title="The platform now has a proper docs route instead of dead links."
            description="This page maps directly to the prompt: server-to-server example, widget example, webhook example, and clear privacy and security notes."
          />

          <div className="mt-12 grid gap-8 xl:grid-cols-3">
            <div className="card-panel p-6 xl:col-span-2">
              <CodeBlock title="Server-to-server generation request">
                {`curl -X POST https://api.virtualfit.dev/api/v1/tryon/generations \\
  -H "Authorization: Bearer sk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_id": "dress_123",
    "product_name": "Rose Panel Dress",
    "product_image_url": "https://store.com/rose-panel.jpg",
    "user_photo_url": "https://merchant-backend.com/uploads/shopper-01.jpg",
    "output_count": 4
  }'`}
              </CodeBlock>
            </div>
            <div className="card-panel p-6">
              <div className="eyebrow">Security notes</div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>Use a secret API key only on the merchant backend.</p>
                <p>Restrict public widget tokens by allowed domain.</p>
                <p>Show consent and privacy language before upload.</p>
                <p>Present results as previews, not exact fit guarantees.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <CodeBlock title="Widget example">
              {`<script src="https://cdn.virtualfit.dev/tryon-widget.js"></script>
<script>
  TryOnWidget.init({
    publicKey: "pk_live_xxx",
    productId: "dress_123",
    productName: "Rose Panel Dress",
    productImageUrl: "https://store.com/products/rose-panel.jpg",
    container: "#tryon-button"
  });
</script>`}
            </CodeBlock>

            <CodeBlock title="Webhook example">
              {`POST /merchant/webhooks/virtualfit
{
  "generation_id": "gen_1001",
  "status": "completed",
  "organization_id": "store_123",
  "images": [
    { "view_type": "front", "signed_url": "..." },
    { "view_type": "left", "signed_url": "..." },
    { "view_type": "right", "signed_url": "..." },
    { "view_type": "back", "signed_url": "..." }
  ]
}`}
            </CodeBlock>
          </div>

          <div className="mt-8 card-panel p-6">
            <div className="eyebrow">Merchant note</div>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-300">
              If you embed the public widget, you still need to supply your own
              storefront-specific consent copy and privacy references. The
              product should never imply that AI-generated views are exact
              measurements of real-world fit.
            </p>
            <div className="mt-6">
              <Link href="/dashboard" className="button-secondary">
                Open dashboard
              </Link>
            </div>
          </div>
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}
