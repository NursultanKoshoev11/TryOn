# TryOnAI Integration Guide

## Overview

TryOnAI provides two integration methods:

1. **Server-to-Server API** - For backend integration with your e-commerce platform
2. **Embeddable Widget** - For frontend integration on product pages

## Getting Started

### 1. Create Account

1. Go to https://app.example.com
2. Click "Get Started"
3. Register with email and password
4. Verify your email

### 2. Create Store

1. Log in to dashboard
2. Click "Create Store"
3. Enter store name and domain
4. Choose subscription plan

### 3. Get API Key

1. Go to store settings
2. Click "API Keys"
3. Click "Create API Key"
4. Copy the key (shown only once)
5. Store securely in your backend

## Server-to-Server Integration

### Authentication

Include API key in Authorization header:

```bash
Authorization: Bearer sk_live_xxx
```

### Create Generation Job

```bash
curl -X POST https://api.example.com/api/v1/tryon/generations \
  -H "Authorization: Bearer sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "dress_123",
    "product_name": "Summer Dress",
    "product_image_url": "https://store.com/products/dress.jpg",
    "user_photo_url": "https://store.com/uploads/user_photo.jpg",
    "output_count": 4,
    "callback_url": "https://store.com/webhook/tryon"
  }'
```

### Response

```json
{
  "id": "gen_abc123xyz",
  "status": "queued",
  "product_id": "dress_123",
  "product_name": "Summer Dress",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Poll for Results

```bash
curl https://api.example.com/api/v1/tryon/generations/gen_abc123xyz \
  -H "Authorization: Bearer sk_live_xxx"
```

### Response (Processing)

```json
{
  "id": "gen_abc123xyz",
  "status": "processing",
  "product_id": "dress_123",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Response (Completed)

```json
{
  "id": "gen_abc123xyz",
  "status": "completed",
  "product_id": "dress_123",
  "created_at": "2024-01-01T12:00:00Z",
  "completed_at": "2024-01-01T12:05:00Z",
  "processing_time_ms": 300000
}
```

### Get Generated Images

```bash
curl https://api.example.com/api/v1/tryon/generations/gen_abc123xyz/images \
  -H "Authorization: Bearer sk_live_xxx"
```

### Response

```json
{
  "images": [
    {
      "id": "img_1",
      "view_type": "front",
      "url": "https://cdn.example.com/signed-url-front",
      "expires_at": "2024-01-02T12:00:00Z"
    },
    {
      "id": "img_2",
      "view_type": "left",
      "url": "https://cdn.example.com/signed-url-left",
      "expires_at": "2024-01-02T12:00:00Z"
    },
    {
      "id": "img_3",
      "view_type": "right",
      "url": "https://cdn.example.com/signed-url-right",
      "expires_at": "2024-01-02T12:00:00Z"
    },
    {
      "id": "img_4",
      "view_type": "back",
      "url": "https://cdn.example.com/signed-url-back",
      "expires_at": "2024-01-02T12:00:00Z"
    }
  ]
}
```

### Example: Node.js Implementation

```javascript
const axios = require('axios');

const API_KEY = 'sk_live_xxx';
const API_URL = 'https://api.example.com/api/v1';

async function createTryOn(productId, productName, productImageUrl, userPhotoUrl) {
  try {
    // Create generation job
    const response = await axios.post(
      `${API_URL}/tryon/generations`,
      {
        product_id: productId,
        product_name: productName,
        product_image_url: productImageUrl,
        user_photo_url: userPhotoUrl,
        output_count: 4,
        callback_url: 'https://store.com/webhook/tryon'
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generationId = response.data.id;
    console.log('Generation created:', generationId);

    // Poll for results
    let status = 'queued';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await axios.get(
        `${API_URL}/tryon/generations/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );

      status = statusResponse.data.status;
      console.log(`Status: ${status}`);
      attempts++;
    }

    if (status === 'completed') {
      // Get images
      const imagesResponse = await axios.get(
        `${API_URL}/tryon/generations/${generationId}/images`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );

      const images = imagesResponse.data.images;
      console.log('Generated images:', images);
      return images;
    } else {
      throw new Error(`Generation failed or timed out. Status: ${status}`);
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
createTryOn(
  'dress_123',
  'Summer Dress',
  'https://store.com/products/dress.jpg',
  'https://store.com/uploads/user_photo.jpg'
).then(images => {
  console.log('Try-on complete:', images);
});
```

## Webhook Integration

### Configure Webhook

1. Go to store settings
2. Click "Webhooks"
3. Enter webhook URL
4. Copy webhook secret

### Webhook Payload

When generation completes, we POST to your webhook URL:

```json
{
  "event": "generation.completed",
  "generation_id": "gen_abc123xyz",
  "product_id": "dress_123",
  "product_name": "Summer Dress",
  "status": "completed",
  "images": [
    {
      "view_type": "front",
      "url": "https://cdn.example.com/signed-url-front"
    },
    {
      "view_type": "left",
      "url": "https://cdn.example.com/signed-url-left"
    },
    {
      "view_type": "right",
      "url": "https://cdn.example.com/signed-url-right"
    },
    {
      "view_type": "back",
      "url": "https://cdn.example.com/signed-url-back"
    }
  ],
  "created_at": "2024-01-01T12:00:00Z",
  "completed_at": "2024-01-01T12:05:00Z",
  "processing_time_ms": 300000
}
```

### Verify Webhook Signature

Webhook includes `X-TryOnAI-Signature` header:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}

// In your webhook handler
app.post('/webhook/tryon', (req, res) => {
  const signature = req.headers['x-tryon-ai-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  console.log('Generation completed:', req.body.generation_id);
  res.json({ ok: true });
});
```

## Embeddable Widget Integration

### Basic Setup

Add to your product page HTML:

```html
<div id="tryon-button"></div>

<script src="https://cdn.example.com/tryon-widget.js"></script>
<script>
  TryOnWidget.init({
    publicKey: "pk_live_xxx",
    productId: "dress_123",
    productName: "Summer Dress",
    productImageUrl: "https://store.com/products/dress.jpg",
    container: "#tryon-button"
  });
</script>
```

### Configuration Options

```javascript
TryOnWidget.init({
  // Required
  publicKey: "pk_live_xxx",           // Public key from dashboard
  productId: "dress_123",              // Your product ID
  productName: "Summer Dress",         // Product name
  productImageUrl: "https://...",      // Product image URL
  container: "#tryon-button",          // DOM selector for button

  // Optional
  apiUrl: "https://api.example.com",   // Custom API URL
  onSuccess: (images) => {              // Success callback
    console.log('Try-on complete:', images);
  },
  onError: (error) => {                 // Error callback
    console.error('Try-on failed:', error);
  }
});
```

### Widget Behavior

1. User clicks "Virtual Try-On" button
2. Modal opens with:
   - Disclaimer about AI-generated preview
   - Photo upload input
   - Consent checkbox
   - Generate button
3. User uploads photo and consents
4. Widget shows processing status
5. Results displayed in 2x2 grid
6. User can close modal

### Styling

Widget uses default styling but can be customized via CSS:

```css
.tryon-button {
  /* Button styling */
}

.tryon-modal {
  /* Modal styling */
}

.tryon-images {
  /* Results grid styling */
}
```

### Advanced: Custom Styling

```html
<style>
  .tryon-button {
    background-color: #ff6b6b;
    padding: 12px 24px;
    font-size: 16px;
  }
</style>

<div id="tryon-button"></div>

<script src="https://cdn.example.com/tryon-widget.js"></script>
<script>
  TryOnWidget.init({
    publicKey: "pk_live_xxx",
    productId: "dress_123",
    productName: "Summer Dress",
    productImageUrl: "https://store.com/products/dress.jpg",
    container: "#tryon-button"
  });
</script>
```

## Error Handling

### Common Errors

#### Invalid API Key
```json
{
  "error": "unauthorized",
  "message": "Invalid API key",
  "status": 401
}
```

#### Domain Not Allowed
```json
{
  "error": "forbidden",
  "message": "Domain not allowed for this API key",
  "status": 403
}
```

#### Rate Limit Exceeded
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "status": 429
}
```

#### Subscription Limit Exceeded
```json
{
  "error": "quota_exceeded",
  "message": "Monthly generation limit exceeded",
  "status": 402
}
```

#### Invalid Image
```json
{
  "error": "invalid_image",
  "message": "Image must be JPEG, PNG, or WebP",
  "status": 400
}
```

## Best Practices

### Security

1. **Never expose API key in frontend**
   - Use server-to-server integration for sensitive operations
   - Use public key only for widget

2. **Validate user input**
   - Check image format and size before upload
   - Validate product IDs

3. **Use HTTPS**
   - All API calls must use HTTPS
   - Widget only works on HTTPS domains

4. **Rotate API keys regularly**
   - Create new key
   - Update application
   - Revoke old key

### Performance

1. **Implement polling with backoff**
   - Start with 2-second intervals
   - Increase to 5-10 seconds after 10 attempts
   - Max timeout: 5 minutes

2. **Cache results**
   - Store generated images in your CDN
   - Reuse for same product/user combination

3. **Optimize images**
   - Compress product images before upload
   - Use WebP format when possible

### User Experience

1. **Show clear disclaimers**
   - "AI-generated preview"
   - "Fit and appearance may vary"
   - Link to privacy policy

2. **Provide feedback**
   - Show loading states
   - Display error messages clearly
   - Allow retry on failure

3. **Mobile-friendly**
   - Widget works on mobile
   - Responsive image display
   - Touch-friendly buttons

## Support

- Documentation: https://docs.example.com
- API Reference: https://api.example.com/docs
- Email: support@example.com
- Status: https://status.example.com
