import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function StorePage() {
  const router = useRouter();
  const { id } = router.query;
  const [store, setStore] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (id) {
      fetchStoreData();
    }
  }, [id]);

  const fetchStoreData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [storeRes, keysRes, usageRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${id}/api-keys`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${id}/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (storeRes.ok) setStore(await storeRes.json());
      if (keysRes.ok) setApiKeys((await keysRes.json()).api_keys || []);
      if (usageRes.ok) setUsage(await usageRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${id}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKeys([...apiKeys, newKey]);
        setNewKeyName('');
        setShowNewKeyForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{store?.name} - TryOnAI</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
              TryOnAI
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Back to Dashboard
            </Link>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{store?.name}</h1>

          {/* Usage Stats */}
          {usage && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-2">Total Generations</p>
                <p className="text-3xl font-bold text-gray-900">{usage.total_generations || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-2">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{usage.monthly_generations || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-2">Remaining Quota</p>
                <p className="text-3xl font-bold text-gray-900">{usage.remaining_quota || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-2">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{usage.success_rate || '0'}%</p>
              </div>
            </div>
          )}

          {/* API Keys Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
              <button
                onClick={() => setShowNewKeyForm(!showNewKeyForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create API Key
              </button>
            </div>

            {showNewKeyForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Key name (e.g., Production)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCreateKey}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewKeyForm(false)}
                    className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {apiKeys.length === 0 ? (
              <p className="text-gray-600">No API keys yet. Create one to get started.</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{key.name}</p>
                      <p className="text-sm text-gray-600">sk_live_****{key.key_prefix}</p>
                      <p className="text-xs text-gray-500 mt-1">Created: {new Date(key.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-red-600 hover:text-red-700 text-sm font-semibold">
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integration Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Widget Integration</h3>
                <p className="text-gray-600 mb-4">Add this script to your product pages:</p>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {`<script src="https://cdn.example.com/tryon-widget.js"></script>
<script>
  TryOnWidget.init({
    publicKey: "pk_live_xxx",
    productId: "product_123",
    productName: "Product Name",
    productImageUrl: "https://...",
    container: "#tryon-button"
  });
</script>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
