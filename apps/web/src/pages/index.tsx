import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>TryOnAI - The #1 AI Virtual Try-On for E-Commerce</title>
        <meta name="description" content="Land more sales 24/7 without the hassle. AI-powered virtual try-on for fashion stores." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation */}
        <nav className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="text-3xl font-bold text-white">TryOnAI</div>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
            <div className="text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold">
                The #1 AI Virtual Try-On Platform
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
                Land Sales 24/7<br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Without The Hassle
                </span>
              </h1>
              <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                For fashion stores who want to automate virtual try-on and never miss a customer.
              </p>
              <div className="flex gap-6 justify-center">
                <Link href="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold text-lg transition shadow-lg shadow-blue-500/50">
                  Start Free Trial
                </Link>
                <Link href="#demo" className="border-2 border-gray-600 text-white px-10 py-4 rounded-lg hover:bg-gray-800 font-bold text-lg transition">
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-16">
              Trusted by the top 1% of fashion stores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-6 text-center">
                  <div className="text-gray-400 font-semibold">Store {i}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-white mb-6">
                The Numbers Speak For Themselves
              </h2>
              <p className="text-xl text-gray-400">Real results from real stores</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  85%
                </div>
                <div className="text-2xl text-white font-semibold mb-2">Conversion Increase</div>
                <div className="text-gray-400">Average across all stores</div>
              </div>
              <div className="text-center">
                <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  60%
                </div>
                <div className="text-2xl text-white font-semibold mb-2">Return Reduction</div>
                <div className="text-gray-400">Customers see the fit first</div>
              </div>
              <div className="text-center">
                <div className="text-7xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                  24/7
                </div>
                <div className="text-2xl text-white font-semibold mb-2">Always Available</div>
                <div className="text-gray-400">Never miss a customer</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="text-blue-400 font-semibold mb-4 text-sm uppercase tracking-wider">Enhanced Features</div>
              <h2 className="text-5xl font-bold text-white mb-6">
                AI That Works While You Sleep
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'AI-Powered Generation',
                  description: 'Advanced AI generates 4 realistic try-on views in seconds. Front, left, right, and back angles for complete visualization.',
                  icon: '🤖'
                },
                {
                  title: 'Instant Integration',
                  description: 'One line of code. Works with Shopify, WooCommerce, and any e-commerce platform. No technical knowledge required.',
                  icon: '⚡'
                },
                {
                  title: 'Privacy First',
                  description: 'Customer photos automatically deleted after 30 days. GDPR compliant. No data sold to third parties. Ever.',
                  icon: '🔒'
                },
                {
                  title: 'Real-Time Analytics',
                  description: 'Track conversion rates, usage, and ROI in real-time. See exactly how virtual try-on impacts your bottom line.',
                  icon: '📊'
                },
                {
                  title: 'Unlimited Campaigns',
                  description: 'Create unlimited product campaigns. A/B test different approaches. Optimize for maximum conversions.',
                  icon: '🚀'
                },
                {
                  title: 'API Access',
                  description: 'Full REST API access. Build custom integrations. Automate workflows. Complete developer documentation.',
                  icon: '💻'
                }
              ].map((feature, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-white mb-6">
                The Lowest Cost Per Sale In The Game
              </h2>
              <p className="text-xl text-gray-400">Stop losing customers. Start converting 24/7.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Without TryOnAI */}
              <div className="bg-gray-800/50 border-2 border-red-500/30 rounded-2xl p-10">
                <div className="text-center mb-8">
                  <div className="text-red-400 font-bold text-xl mb-4">Without TryOnAI</div>
                  <div className="text-gray-400 text-sm">High returns, lost sales, wasted time</div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>40% return rate</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>Customers unsure about fit</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>Lost sales from hesitation</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>Manual customer support</span>
                  </li>
                </ul>
                <div className="text-center pt-8 border-t border-gray-700">
                  <div className="text-5xl font-bold text-red-400 mb-2">$127</div>
                  <div className="text-gray-400">cost per sale</div>
                </div>
              </div>

              {/* With TryOnAI */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-2xl p-10 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                  RECOMMENDED
                </div>
                <div className="text-center mb-8">
                  <div className="text-blue-400 font-bold text-xl mb-4">With TryOnAI</div>
                  <div className="text-gray-300 text-sm">Low returns, high conversions, automated</div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-gray-200">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>15% return rate (60% reduction)</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-200">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Customers see exact fit</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-200">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>85% conversion increase</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-200">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Fully automated 24/7</span>
                  </li>
                </ul>
                <div className="text-center pt-8 border-t border-blue-500/30">
                  <div className="text-5xl font-bold text-blue-400 mb-2">$18</div>
                  <div className="text-gray-300">cost per sale</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="text-blue-400 font-semibold mb-4 text-sm uppercase tracking-wider">⭐ Testimonials</div>
              <h2 className="text-5xl font-bold text-white mb-6">
                What our users say
              </h2>
              <p className="text-xl text-gray-400">Trusted by top fashion stores worldwide</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  company: 'Fashion Boutique',
                  quote: 'We closed our first $15,000 sale within 2 weeks of using TryOnAI. Returns dropped by 65%. This is a game-changer.',
                  author: 'Sarah Johnson',
                  role: 'Owner'
                },
                {
                  company: 'Style Studio',
                  quote: 'TryOnAI increased our conversion rate by 92%. Customers love seeing how clothes actually fit before buying.',
                  author: 'Michael Chen',
                  role: 'CEO'
                },
                {
                  company: 'Urban Threads',
                  quote: 'Best investment we made this year. ROI was positive in the first month. Customer satisfaction through the roof.',
                  author: 'Emma Davis',
                  role: 'Founder'
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
                    <div>
                      <div className="text-white font-bold">{testimonial.company}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="text-gray-400 font-semibold">{testimonial.author}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-6xl font-bold text-white mb-8">
              Ready to 10x Your Sales?
            </h2>
            <p className="text-2xl text-gray-300 mb-12">
              Join hundreds of fashion stores using AI to convert more customers
            </p>
            <Link href="/register" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold text-xl transition shadow-2xl shadow-blue-500/50">
              Start Free Trial →
            </Link>
            <p className="text-gray-400 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="text-2xl font-bold text-white mb-4">TryOnAI</div>
                <p className="text-gray-400">AI-powered virtual try-on for fashion stores</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Product</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Security</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Developers</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-white transition">API Reference</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Integration</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><Link href="#" className="hover:text-white transition">About</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2024 TryOnAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}