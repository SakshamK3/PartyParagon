import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import productsData from "@/data/products.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_PATH = "data/categories.json";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_SECRET;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  premium?: boolean;
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.storage
    .from("product-images")
    .download(STORAGE_PATH);

  if (!data) {
    // First time: seed from static products.json
    return productsData.categories as Category[];
  }

  try {
    const text = await data.text();
    return JSON.parse(text);
  } catch {
    return productsData.categories as Category[];
  }
}

async function saveCategories(categories: Category[]) {
  const blob = new Blob([JSON.stringify(categories, null, 2)], {
    type: "application/json",
  });
  await supabase.storage
    .from("product-images")
    .upload(STORAGE_PATH, blob, { contentType: "application/json", upsert: true });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, description, image, premium } = body;

  if (!name || !slug)
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );

  const categories = await getCategories();
  const exists = categories.find((c) => c.id === slug);
  if (exists)
    return NextResponse.json(
      { error: "Category with this slug already exists" },
      { status: 400 }
    );

  categories.push({
    id: slug,
    name,
    slug,
    description: description || "",
    image: image || `/images/categories/${slug}.jpg`,
    premium: premium || false,
  });

  await saveCategories(categories);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, description, premium } = body;

  const categories = await getCategories();
  const cat = categories.find((c) => c.id === id);
  if (!cat)
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );

  if (name) cat.name = name;
  if (description !== undefined) cat.description = description;
  if (premium !== undefined) cat.premium = premium;

  await saveCategories(categories);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  const categories = await getCategories();
  const filtered = categories.filter((c) => c.id !== id);

  if (filtered.length === categories.length)
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );

  await saveCategories(filtered);
  return NextResponse.json({ success: true });
}
