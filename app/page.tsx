import Link from "next/link";
import { getAllCategories, getProductCount, getCategoryProductCount, getSiteSettings } from "@/lib/products";

const CATEGORY_IMAGE_BASE = "https://mmxbfloqzooisubyvvtb.supabase.co/storage/v1/object/public/product-images/categories";

const stats = [
  { label: "Products", value: "200+" },
  { label: "Categories", value: "16" },
  { label: "Years in Business", value: "10+" },
  { label: "Happy Clients", value: "500+" },
];

export const revalidate = 3;

export default async function HomePage() {
  const categories = getAllCategories();
  const totalProducts = await getProductCount();
  const settings = await getSiteSettings();
  const regularCategories = categories.filter((c) => !c.premium);
  const premiumCategories = categories.filter((c) => c.premium);

  const catCounts: Record<string, number> = {};
  for (const cat of categories) {
    catCounts[cat.id] = await getCategoryProductCount(cat.id);
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <img src={`${CATEGORY_IMAGE_BASE}/hero.png`} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-primary-300 mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              B2B Wholesale Partner
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your One-Stop <span className="text-primary-400">Party Supply</span> Wholesale Partner
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl">
              From balloons to backdrops, cake stands to costumes — we supply {totalProducts}+ premium party products at wholesale prices with flexible MOQ options.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/catalog" className="btn-primary text-lg">
                Browse Catalog
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a href={`https://wa.me/${settings.whatsapp}?text=Hi%20Party%20Paragon%2C%20I%27m%20interested%20in%20your%20wholesale%20products`} target="_blank" rel="noopener noreferrer" className="border-2 border-white/30 text-white font-semibold py-3 px-8 rounded-full hover:bg-white/10 transition-all inline-flex items-center gap-2 text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regular Categories */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Party Essentials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everyday party supplies at unbeatable wholesale prices. Bulk packaging with tiered MOQ pricing.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {regularCategories.map((cat) => (
              <Link key={cat.id} href={`/catalog/${cat.slug}`} className="group relative rounded-2xl overflow-hidden card-hover border border-gray-100 bg-white">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={`${CATEGORY_IMAGE_BASE}/${cat.id}.png`}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-sm md:text-base leading-tight">{cat.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">{catCounts[cat.id]} products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Categories */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 rounded-full px-4 py-1.5 text-sm font-medium text-amber-700 mb-4 border border-amber-200">★ Premium Collection</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Custom Event Props & Décor</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Handcrafted MDF, iron, and fiber props. Fully customizable colors and designs for your event business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumCategories.map((cat) => (
              <Link key={cat.id} href={`/catalog/${cat.slug}`} className="group bg-white rounded-2xl overflow-hidden card-hover border border-gray-100">
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={`${CATEGORY_IMAGE_BASE}/${cat.id}.png`}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-white/70 text-sm">{cat.description}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">{catCounts[cat.id]} products</span>
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">Customizable →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Party Paragon?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🏷️", title: "Wholesale Prices", desc: "Tiered pricing that rewards bigger orders. The more you buy, the more you save." },
              { icon: "📦", title: "Flexible MOQ", desc: "From 10 pieces to 2000+ — we have MOQ options for businesses of every size." },
              { icon: "🎨", title: "Custom Solutions", desc: "Premium props and backdrops customized to your exact specifications and brand colors." },
              { icon: "🚚", title: "Pan-India Delivery", desc: "Reliable shipping across India with bulk order logistics support." },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={`${CATEGORY_IMAGE_BASE}/cta.png`} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-bg opacity-90" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center text-white section-padding">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Stock Up?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Get wholesale pricing, custom quotes, and dedicated support for your party supply business.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/catalog" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">View Full Catalog</Link>
            <Link href="/contact" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white/10 transition-all">Request Quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
