# TryOnAI Integration Examples

## Python Backend Integration

```python
import requests
import time
import json

API_KEY = 'sk_live_xxx'
API_URL = 'https://api.example.com/api/v1'

class TryOnAIClient:
    def __init__(self, api_key, api_url=API_URL):
        self.api_key = api_key
        self.api_url = api_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def create_generation(self, product_id, product_name, product_image_url, user_photo_url):
        """Create a new generation job"""
        payload = {
            'product_id': product_id,
            'product_name': product_name,
            'product_image_url': product_image_url,
            'user_photo_url': user_photo_url,
            'output_count': 4
        }
        
        response = requests.post(
            f'{self.api_url}/tryon/generations',
            json=payload,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_generation_status(self, generation_id):
        """Get generation status"""
        response = requests.get(
            f'{self.api_url}/tryon/generations/{generation_id}',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_generated_images(self, generation_id):
        """Get generated images"""
        response = requests.get(
            f'{self.api_url}/tryon/generations/{generation_id}/images',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def wait_for_completion(self, generation_id, max_wait_seconds=300):
        """Poll until generation is complete"""
        start_time = time.time()
        
        while time.time() - start_time < max_wait_seconds:
            status = self.get_generation_status(generation_id)
            
            if status['status'] == 'completed':
                return self.get_generated_images(generation_id)
            elif status['status'] == 'failed':
                raise Exception(f"Generation failed: {status.get('error_message')}")
            
            time.sleep(5)  # Wait 5 seconds before polling again
        
        raise TimeoutError(f"Generation did not complete within {max_wait_seconds} seconds")

# Usage
client = TryOnAIClient(API_KEY)

try:
    # Create generation
    gen = client.create_generation(
        product_id='dress_123',
        product_name='Summer Dress',
        product_image_url='https://store.com/products/dress.jpg',
        user_photo_url='https://store.com/uploads/user_photo.jpg'
    )
    
    generation_id = gen['id']
    print(f'Generation created: {generation_id}')
    
    # Wait for completion
    images = client.wait_for_completion(generation_id)
    
    print('Generated images:')
    for img in images['images']:
        print(f"  {img['view_type']}: {img['url']}")
        
except Exception as e:
    print(f'Error: {e}')
```

## PHP Backend Integration

```php
<?php

class TryOnAIClient {
    private $apiKey;
    private $apiUrl;
    
    public function __construct($apiKey, $apiUrl = 'https://api.example.com/api/v1') {
        $this->apiKey = $apiKey;
        $this->apiUrl = $apiUrl;
    }
    
    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->apiUrl . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            throw new Exception("API Error: $response");
        }
        
        return json_decode($response, true);
    }
    
    public function createGeneration($productId, $productName, $productImageUrl, $userPhotoUrl) {
        return $this->makeRequest('POST', '/tryon/generations', [
            'product_id' => $productId,
            'product_name' => $productName,
            'product_image_url' => $productImageUrl,
            'user_photo_url' => $userPhotoUrl,
            'output_count' => 4
        ]);
    }
    
    public function getGenerationStatus($generationId) {
        return $this->makeRequest('GET', "/tryon/generations/$generationId");
    }
    
    public function getGeneratedImages($generationId) {
        return $this->makeRequest('GET', "/tryon/generations/$generationId/images");
    }
    
    public function waitForCompletion($generationId, $maxWaitSeconds = 300) {
        $startTime = time();
        
        while (time() - $startTime < $maxWaitSeconds) {
            $status = $this->getGenerationStatus($generationId);
            
            if ($status['status'] === 'completed') {
                return $this->getGeneratedImages($generationId);
            } elseif ($status['status'] === 'failed') {
                throw new Exception("Generation failed: " . $status['error_message']);
            }
            
            sleep(5);
        }
        
        throw new Exception("Generation did not complete within $maxWaitSeconds seconds");
    }
}

// Usage
try {
    $client = new TryOnAIClient('sk_live_xxx');
    
    $gen = $client->createGeneration(
        'dress_123',
        'Summer Dress',
        'https://store.com/products/dress.jpg',
        'https://store.com/uploads/user_photo.jpg'
    );
    
    $generationId = $gen['id'];
    echo "Generation created: $generationId\n";
    
    $images = $client->waitForCompletion($generationId);
    
    echo "Generated images:\n";
    foreach ($images['images'] as $img) {
        echo "  {$img['view_type']}: {$img['url']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

## React Component Example

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const TryOnWidget = ({ productId, productName, productImageUrl }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [consent, setConsent] = useState(false);

  const API_KEY = process.env.REACT_APP_API_KEY;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photoFile) {
      setError('Please select a photo');
      return;
    }
    
    if (!consent) {
      setError('Please consent to photo upload');
      return;
    }

    setLoading(true);
    setError(null);
    setImages(null);

    try {
      // Upload photo and create generation
      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('product_name', productName);
      formData.append('product_image_url', productImageUrl);
      formData.append('user_photo', photoFile);
      formData.append('output_count', '4');

      const response = await axios.post(
        `${API_URL}/api/v1/tryon/generations`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const generationId = response.data.id;

      // Poll for completion
      let completed = false;
      let attempts = 0;
      const maxAttempts = 60;

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const statusResponse = await axios.get(
          `${API_URL}/api/v1/tryon/generations/${generationId}`,
          {
            headers: {
              'Authorization': `Bearer ${API_KEY}`
            }
          }
        );

        if (statusResponse.data.status === 'completed') {
          // Get images
          const imagesResponse = await axios.get(
            `${API_URL}/api/v1/tryon/generations/${generationId}/images`,
            {
              headers: {
                'Authorization': `Bearer ${API_KEY}`
              }
            }
          );

          setImages(imagesResponse.data.images);
          completed = true;
        } else if (statusResponse.data.status === 'failed') {
          throw new Error('Generation failed');
        }

        attempts++;
      }

      if (!completed) {
        throw new Error('Generation timed out');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tryon-widget">
      <h2>Virtual Try-On</h2>
      
      {error && <div className="error">{error}</div>}
      
      {!images ? (
        <form onSubmit={handleSubmit}>
          <div>
            <p className="disclaimer">
              <strong>Disclaimer:</strong> AI-generated preview. Fit and appearance may vary.
            </p>
          </div>
          
          <div>
            <label>Upload Your Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={loading}
            />
          </div>
          
          <div>
            <label>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={loading}
              />
              I consent to upload my photo for virtual try-on processing
            </label>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Try-On'}
          </button>
        </form>
      ) : (
        <div className="results">
          <h3>Results</h3>
          <div className="images-grid">
            {images.map((img) => (
              <div key={img.id} className="image-item">
                <img src={img.url} alt={img.view_type} />
                <p>{img.view_type}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setImages(null)}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default TryOnWidget;
```

## Webhook Handler Example (Express.js)

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifyWebhookSignature(payload, signature) {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

app.post('/webhook/tryon', (req, res) => {
  const signature = req.headers['x-tryon-ai-signature'];
  
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { event, generation_id, status, images, product_id } = req.body;
  
  if (event === 'generation.completed' && status === 'completed') {
    console.log(`Generation ${generation_id} completed for product ${product_id}`);
    
    // Store images in your database
    images.forEach(img => {
      console.log(`  ${img.view_type}: ${img.url}`);
    });
    
    // Notify customer
    // sendEmailToCustomer(generation_id, images);
    
    // Update product page
    // updateProductPage(product_id, images);
  }
  
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```
