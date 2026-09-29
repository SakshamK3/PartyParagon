import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProducts, getAllCategories, getProduct, getCategory, getProductsByCategory, getSiteSettings, formatPrice, getProductImageUrl } from "@/lib/products";

export const revalidate = 60;

export function generateStaticParams() {
  const categories = getAllCategories();
  const products = require("@/data/products.json").products;
  return products.map((p: { id: string; category: string }) => {
    const cat = categories.find((c) => c.id === p.category);
    return { slug: cat?.slug || p.category, productId: p.id };
  });
}

export async function generateMetadata({ params }: { params: { slug: string; productId: string } }): Promise<Metadata> {
  const product = await getProduct(params.productId);
  if (!product) return { title: "Product Not Found" };
  return { title: `${product.name} | Party Paragon Wholesale`, description: product.description };
}

export default async function ProductPage({ params }: { params: { slug: string; productId: string } }) {
  const product = await getProduct(params.productId);
  if (!product) notFound();

  const category = getCategory(params.slug);
  const settings = await getSiteSettings();
  const relatedProducts = (await getProductsByCategory(product.category)).filter((p) => p.id !== product.id).slice(0, 4);
  const imageUrl = getProductImageUrl(product);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-primary-600">Catalog</Link>
        <span>/</span>
        <Link href={`/catalog/${params.slug}`} className="hover:text-primary-600">{category?.name || params.slug}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl flex items-center justify-center aspect-square max-h-[500px] overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover rounded-3xl" />
          ) : (
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-gray-400 text-sm mt-2">Image coming soon</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.customizable && <span className="text-xs font-medium text-primary-700 bg-primary-100 px-3 py-1 rounded-full">Customizable</span>}
            {product.brand && <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{product.brand}</span>}
          </div>

          <h1 className="text-2xl md:text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-6">SKU: {product.sku}</p>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>

          <div className="space-y-3 mb-8">
            {product.size && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-20">Size</span>
                <span className="font-medium">{product.size}</span>
              </div>
            )}
            {product.material && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-20">Material</span>
                <span className="font-medium">{product.material}</span>
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-gray-500 text-sm w-20 mt-1">Colors</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <span key={color} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{color}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Table */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-lg mb-4">Wholesale Pricing</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Quantity (MOQ)</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-600">Price per {product.pricing[0]?.unit || "unit"}</th>
                </tr>
              </thead>
              <tbody>
                {product.pricing.map((tier, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-2">
                      <span className="font-medium">{tier.moq.toLocaleString()}+</span>{" "}
                      <span className="text-gray-500">{tier.unit}</span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-lg font-bold text-primary-600">{formatPrice(tier.price)}</span>
                      <span className="text-gray-500 text-xs block">per {tier.unit === "set of 3" ? "set" : tier.unit.replace(/s$/, "")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${settings.whatsapp}?text=Hi%20Party%20Paragon%2C%20I%27m%20interested%20in%20${encodeURIComponent(product.name)}%20(SKU:%20${encodeURIComponent(product.sku)})`}
              target="_blank" rel="noopener noreferrer" className="btn-primary"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Inquire on WhatsApp
            </a>
            <Link href={`/catalog/${params.slug}`} className="btn-outline">Back to {category?.name || "Category"}</Link>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => {
              const rpImage = getProductImageUrl(rp);
              return (
                <Link key={rp.id} href={`/catalog/${params.slug}/${rp.id}`} className="bg-white rounded-xl border border-gray-200 p-4 card-hover">
                  <div className="h-24 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                    {rpImage ? <img src={rpImage} alt={rp.name} className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">{rp.name}</h3>
                  <p className="text-primary-600 font-bold text-sm">{formatPrice(Math.min(...rp.pricing.map((p) => p.price)))}+</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
