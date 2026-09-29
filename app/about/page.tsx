import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Party Paragon",
  description:
    "Learn about Party Paragon — India's premium B2B wholesale supplier of party decorations and event supplies.",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* Hero */}
      <div className="max-w-3xl mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          About <span className="gradient-text">Party Paragon</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          We are India&apos;s trusted B2B wholesale supplier of premium party
          decorations and event supplies, serving event planners, decorators,
          retailers, and businesses across the country.
        </p>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Party Paragon was founded with a simple mission: to make premium
              party supplies accessible to businesses across India at wholesale
              prices.
            </p>
            <p>
              Over the years, we&apos;ve grown from a small supplier to a
              comprehensive party supply partner, offering everything from basic
              balloons and candles to custom-built MDF backdrops, entry gates,
              and marquee lighting.
            </p>
            <p>
              Today, we serve 500+ businesses nationwide — from small party
              planners to large-scale event companies — with a catalog of 200+
              products and growing.
            </p>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden aspect-square max-h-[400px]">
          <img
            src="https://mmxbfloqzooisubyvvtb.supabase.co/storage/v1/object/public/product-images/categories/about.png"
            alt="Party Paragon — Party supplies and decorations"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "💎",
              title: "Quality First",
              desc: "Every product in our catalog meets strict quality standards. We source from trusted manufacturers and personally verify each batch.",
            },
            {
              icon: "🤝",
              title: "Partnership Approach",
              desc: "We don't just sell products — we build relationships. Our team works with you to find the right products, quantities, and pricing for your business.",
            },
            {
              icon: "🎨",
              title: "Customization",
              desc: "From custom-colored backdrops to branded candy carts, our premium range is fully customizable to match your clients' vision.",
            },
          ].map((val) => (
            <div
              key={val.title}
              className="bg-white rounded-2xl border border-gray-200 p-8 text-center card-hover"
            >
              <span className="text-4xl block mb-4">{val.icon}</span>
              <h3 className="font-bold text-lg mb-3">{val.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Range */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-20">
        <h2 className="text-2xl font-bold mb-6">Our Product Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary-600">
              Party Essentials (₹8 – ₹660)
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">✓ Standard & Metallic Balloons (Thailand, China, Malaysia)</li>
              <li className="flex items-center gap-2">✓ Foil Balloons — 15+ designs (Magic Castle brand)</li>
              <li className="flex items-center gap-2">✓ Cake Toppers — Paper, Acrylic, LED, Metal</li>
              <li className="flex items-center gap-2">✓ Birthday Candles — Spiral, Letter, Glitter, Chrome</li>
              <li className="flex items-center gap-2">✓ Party Caps, Crowns & Tiaras</li>
              <li className="flex items-center gap-2">✓ Fun Goggles & Carnival Masks</li>
              <li className="flex items-center gap-2">✓ Party Poppers — Confetti, Ribbon, Champagne</li>
              <li className="flex items-center gap-2">✓ Banners & Buntings</li>
              <li className="flex items-center gap-2">✓ Themed Foil Balloon Sets</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-amber-600">
              Premium & Custom (₹2,300 – ₹35,000)
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">★ MDF & PLY Photo Backdrops (up to 8ft×16ft)</li>
              <li className="flex items-center gap-2">★ Carnival Entry Gates with Concealed Lighting</li>
              <li className="flex items-center gap-2">★ Wooden & MDF Candy Carts</li>
              <li className="flex items-center gap-2">★ Cake Stands — MDF, Iron, Fiber, Designer</li>
              <li className="flex items-center gap-2">★ ONE Tables with LED/Bulb/Conceal Lighting</li>
              <li className="flex items-center gap-2">★ 3ft Marquee Light-Up Numbers</li>
              <li className="flex items-center gap-2">★ Professional Mascot Costumes</li>
              <li className="flex items-center gap-2">★ All premium items fully customizable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="gradient-bg rounded-3xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Let&apos;s Work Together</h2>
        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
          Whether you need 100 balloons or a custom 10ft backdrop, we&apos;re
          here to be your reliable party supply partner.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/catalog"
            className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Browse Catalog
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white/10 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
