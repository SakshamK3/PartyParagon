import { supabase } from "./supabase";
import productsData from "@/data/products.json";

export interface PriceTier {
  price: number | string;
  moq: number | string;
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

// Categories: try Supabase Storage first, fall back to static JSON
const staticCategories = productsData.categories as Category[];

let cachedCategories: Category[] | null = null;
let categoriesFetchedAt = 0;
const CACHE_TTL = 60_000; // 1 minute

async function fetchCategoriesFromStorage(): Promise<Category[]> {
  try {
    const { data } = await supabase.storage
      .from("product-images")
      .download("data/categories.json");

    if (!data) return staticCategories;
    const text = await data.text();
    return JSON.parse(text);
  } catch {
    return staticCategories;
  }
}

export function getAllCategories(): Category[] {
  // Synchronous — return cached or static (pages that need fresh data should use async version)
  return cachedCategories || staticCategories;
}

export async function getAllCategoriesAsync(): Promise<Category[]> {
  const now = Date.now();
  if (cachedCategories && now - categoriesFetchedAt < CACHE_TTL) {
    return cachedCategories;
  }
  cachedCategories = await fetchCategoriesFromStorage();
  categoriesFetchedAt = now;
  return cachedCategories;
}

export function getCategory(slug: string): Category | undefined {
  return getAllCategories().find((c) => c.slug === slug);
}

export async function getCategoryAsync(slug: string): Promise<Category | undefined> {
  const cats = await getAllCategoriesAsync();
  return cats.find((c) => c.slug === slug);
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

export function formatPrice(price: number | string): string {
  if (typeof price === "string") return price;
  return `₹${price.toLocaleString("en-IN")}`;
}

export function getPriceRange(product: Product): string {
  const numericPrices = product.pricing.map((p) => p.price).filter((p): p is number => typeof p === "number");
  if (numericPrices.length === 0) return String(product.pricing[0]?.price || "On Demand");
  const min = Math.min(...numericPrices);
  const max = Math.max(...numericPrices);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function getProductImageUrl(product: Product): string | null {
  return product.image_url || null;
}
