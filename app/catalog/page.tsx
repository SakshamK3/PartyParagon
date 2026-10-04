import Link from "next/link";
import type { Metadata } from "next";
import { getAllCategories, getCategoryProductCount, getProductCount } from "@/lib/products";

export const metadata: Metadata = {
  title: "Product Catalog | Party Paragon",
  description: "Browse our complete wholesale party supply catalog. 200+ products across 16 categories.",
};

export const revalidate = 3;

const CATEGORY_IMAGE_BASE = "https://mmxbfloqzooisubyvvtb.supabase.co/storage/v1/object/public/product-images/categories";

export default async function CatalogPage() {
  const categories = getAllCategories();
  const totalProducts = await getProductCount();

  const catCounts: Record<string, number> = {};
  for (const cat of categories) {
    catCounts[cat.id] = await getCategoryProductCount(cat.id);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Product <span className="gradient-text">Catalog</span>
        </h1>
        <p className="text-gray-600 text-lg">
          {totalProducts} products across {categories.length} categories. Wholesale pricing with flexible MOQ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = catCounts[cat.id];
          const imageUrl = `${CATEGORY_IMAGE_BASE}/${cat.id}.png`;
          return (
            <Link key={cat.id} href={`/catalog/${cat.slug}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden card-hover">
              <div className="h-48 relative overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {cat.premium && (
                  <span className="absolute top-3 right-3 text-xs font-medium text-amber-100 bg-amber-700/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    ★ Premium
                  </span>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold group-hover:text-primary-600 transition-colors mb-1">{cat.name}</h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{count} product{count !== 1 ? "s" : ""}</span>
                  <span className="text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
