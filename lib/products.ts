import { supabase } from "./supabase";
import productsData from "@/data/products.json";

export interface PriceTier {
  price: number;
  moq: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  brand?: string | null;
  size?: string | null;
  material?: string | null;
  pricing: PriceTier[];
  description: string;
  image_url?: string | null;
  colors?: string[] | null;
  customizable?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  premium?: boolean;
}

export interface SiteSettings {
  phone: string;
  instagram: string;
  instagram_url: string;
  location: string;
  whatsapp: string;
}

// Categories stay static (rarely change)
const categories = productsData.categories as Category[];

export function getAllCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

// Products fetched from Supabase (dynamic prices + images)
export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", categoryId)
    .order("name");

  if (error || !data) {
    // Fallback to static data
    return productsData.products.filter(
      (p) => p.category === categoryId
    ) as Product[];
  }
  return data;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return productsData.products.find((p) => p.id === id) as
      | Product
      | undefined;
  }
  return data;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category, name");

  if (error || !data) {
    return productsData.products as Product[];
  }
  return data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(
      `name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%,brand.ilike.%${q}%`
    );

  if (error || !data) {
    return productsData.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ) as Product[];
  }
  return data;
}

export async function getProductCount(): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  return count ?? productsData.products.length;
}

export async function getCategoryProductCount(
  categoryId: string
): Promise<number> {
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category", categoryId);

  return (
    count ??
    productsData.products.filter((p) => p.category === categoryId).length
  );
}

// Site settings from Supabase
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*");

  const defaults: SiteSettings = {
    phone: "+91 97117 38500",
    instagram: "@partyparagonofficial",
    instagram_url: "https://instagram.com/partyparagonofficial",
    location: "Libaspur Industrial Area, Main Shiv Mandir Marg, Near Samaypur Badli Metro Station",
    whatsapp: "919711738500",
  };

  if (error || !data) return defaults;

  const settings = { ...defaults };
  data.forEach((row: { key: string; value: string }) => {
    if (row.key in settings) {
      (settings as Record<string, string>)[row.key] = row.value;
    }
  });
  return settings;
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function getPriceRange(product: Product): string {
  const prices = product.pricing.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function getProductImageUrl(product: Product): string | null {
  return product.image_url || null;
}
