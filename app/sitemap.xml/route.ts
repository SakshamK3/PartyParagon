import { getAllCategories, getAllProducts } from "@/lib/products";

export async function GET() {
  const baseUrl = "https://party-paragon.vercel.app";
  const categories = getAllCategories();
  const products = await getAllProducts();

  const staticPages = ["", "/catalog", "/about", "/contact"];

  const urls = [
    ...staticPages.map(
      (path) => `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>${path === "" ? "1.0" : "0.8"}</priority></url>`
    ),
    ...categories.map(
      (cat) => `<url><loc>${baseUrl}/catalog/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    ),
    ...products.map(
      (p) => {
        const cat = categories.find((c) => c.id === p.category);
        return `<url><loc>${baseUrl}/catalog/${cat?.slug || p.category}/${p.id}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
      }
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
