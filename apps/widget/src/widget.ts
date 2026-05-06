interface TryOnWidgetConfig {
  publicKey: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  container: string;
  apiUrl?: string;
  onSuccess?: (images: string[]) => void;
  onError?: (error: string) => void;
}

class TryOnWidget {
  private config: TryOnWidgetConfig;
  private modal: HTMLElement | null = null;
  private isOpen = false;

  constructor(config: TryOnWidgetConfig) {
    this.config = {
      apiUrl: 'http://localhost:8080',
      ...config,
    };
    this.init();
  }

  private init() {
    const container = document.querySelector(this.config.container);
    if (!container) {
      console.error(`Container ${this.config.container} not found`);
      return;
    }

    const button = document.createElement('button');
    button.textContent = 'Virtual Try-On';
    button.className = 'tryon-button';
    button.style.cssText = `
      padding: 10px 20px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    `;

    button.addEventListener('click', () => this.openModal());
    container.appendChild(button);
  }

  private openModal() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.modal = document.createElement('div');
    this.modal.className = 'tryon-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: bold;">Virtual Try-On</h2>
        <button id="tryon-close" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: #666; margin-bottom: 10px; font-size: 14px;">
          <strong>Disclaimer:</strong> AI-generated preview. Fit, size and appearance may vary from actual product.
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Upload Your Photo</label>
        <input type="file" id="tryon-photo" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="tryon-consent" />
          <span style="font-size: 14px;">I consent to upload my photo for virtual try-on processing</span>
        </label>
      </div>

      <button id="tryon-submit" style="
        width: 100%;
        padding: 10px;
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
      ">Generate Try-On</button>

      <div id="tryon-status" style="margin-top: 20px; display: none;">
        <p id="tryon-status-text" style="color: #666;"></p>
      </div>

      <div id="tryon-results" style="margin-top: 20px; display: none;">
        <h3 style="margin-bottom: 12px; font-weight: 600;">Results</h3>
        <div id="tryon-images" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;"></div>
      </div>
    `;

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    // Event listeners
    document.getElementById('tryon-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('tryon-submit')?.addEventListener('click', () => this.handleSubmit());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
  }

  private closeModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this.isOpen = false;
    }
  }

  private async handleSubmit() {
    const photoInput = document.getElementById('tryon-photo') as HTMLInputElement;
    const consentCheckbox = document.getElementById('tryon-consent') as HTMLInputElement;
    const statusDiv = document.getElementById('tryon-status');
    const statusText = document.getElementById('tryon-status-text');

    if (!photoInput?.files?.[0]) {
      alert('Please select a photo');
      return;
    }

    if (!consentCheckbox?.checked) {
      alert('Please consent to photo upload');
      return;
    }

    if (statusDiv && statusText) {
      statusDiv.style.display = 'block';
      statusText.textContent = 'Processing... This may take a moment.';
    }

    try {
      const formData = new FormData();
      formData.append('product_id', this.config.productId);
      formData.append('product_name', this.config.productName);
      formData.append('product_image_url', this.config.productImageUrl);
      formData.append('user_photo', photoInput.files[0]);
      formData.append('output_count', '4');

      const response = await fetch(`${this.config.apiUrl}/api/v1/widget/generations`, {
        method: 'POST',
        headers: {
          'X-Public-Key': this.config.publicKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      this.displayResults(data.images || []);

      if (this.config.onSuccess) {
        this.config.onSuccess(data.images || []);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (statusText) statusText.textContent = `Error: ${errorMsg}`;
      if (this.config.onError) {
        this.config.onError(errorMsg);
      }
    }
  }

  private displayResults(images: string[]) {
    const resultsDiv = document.getElementById('tryon-results');
    const imagesDiv = document.getElementById('tryon-images');
    const statusDiv = document.getElementById('tryon-status');

    if (resultsDiv && imagesDiv) {
      imagesDiv.innerHTML = images
        .map(
          (img) => `
        <div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
          <img src="${img}" alt="Try-on result" style="width: 100%; height: auto; display: block;" />
        </div>
      `
        )
        .join('');
      resultsDiv.style.display = 'block';
    }

    if (statusDiv) {
      statusDiv.style.display = 'none';
    }
  }
}

// Global API
(window as any).TryOnWidget = {
  init: (config: TryOnWidgetConfig) => {
    new TryOnWidget(config);
  },
};

export default TryOnWidget;
