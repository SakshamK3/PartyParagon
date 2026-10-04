import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCategories, getCategory, getProductsByCategory, getSiteSettings, formatPrice, getPriceRange, getProductImageUrl } from "@/lib/products";

export const revalidate = 3;

export function generateStaticParams() {
  return getAllCategories().map((cat) => ({ slug: cat.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cat = getCategory(params.slug);
  if (!cat) return { title: "Category Not Found" };
  return { title: `${cat.name} | Party Paragon Wholesale`, description: cat.description };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategory(params.slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);
  const settings = await getSiteSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-primary-600">Catalog</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      <div className="mb-10">
        {category.premium && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-3 inline-block">★ Premium</span>
        )}
        <h1 className="text-3xl md:text-5xl font-bold mb-3">{category.name}</h1>
        <p className="text-gray-600 text-lg">{category.description}</p>
        <p className="text-sm text-gray-500 mt-2">{products.length} product{products.length !== 1 ? "s" : ""} available</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const lowestPrice = product.pricing.every((p) => typeof p.price === "number") ? Math.min(...product.pricing.map((p) => p.price as number)) : null;
          const lowestMOQ = product.pricing.every((p) => typeof p.moq === "number") ? Math.min(...product.pricing.map((p) => p.moq as number)) : null;
          const imageUrl = getProductImageUrl(product);

          return (
            <Link key={product.id} href={`/catalog/${params.slug}/${product.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden card-hover">
              <div className="h-48 bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center relative overflow-hidden p-3">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-4xl text-gray-300">📷</span>
                )}
                {product.customizable && (
                  <span className="absolute top-3 right-3 text-[10px] font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">Customizable</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 text-sm line-clamp-2">{product.name}</h3>
                {product.sku && <p className="text-xs text-gray-400 mb-2">SKU: {product.sku}</p>}
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="text-lg font-bold text-primary-600">{lowestPrice !== null ? getPriceRange(product) : String(product.pricing[0]?.price || "On Demand")}</p>
                    {lowestMOQ !== null && <p className="text-xs text-gray-500">MOQ: {lowestMOQ} {product.pricing[0]?.unit || "pcs"}</p>}
                  </div>
                  {product.brand && <span className="text-[10px] text-gray-400">{product.brand}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl mb-4">No products in this category yet.</p>
          <Link href="/catalog" className="btn-primary">Browse All Categories</Link>
        </div>
      )}

      <div className="mt-16 bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold mb-3">Need a Custom Quote?</h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">Looking for bulk quantities, custom colors, or special packaging? Reach out and we&apos;ll create a tailored quote for you.</p>
        <a href={`https://wa.me/${settings.whatsapp}?text=Hi%20Party%20Paragon%2C%20I%20need%20a%20quote%20for%20${encodeURIComponent(category.name)}`} target="_blank" rel="noopener noreferrer" className="btn-primary">Get Wholesale Quote</a>
      </div>
    </div>
  );
}
