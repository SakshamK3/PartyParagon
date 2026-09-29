import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PRODUCTS_JSON = path.join(process.cwd(), "data", "products.json");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_SECRET;
}

async function readData() {
  const raw = await fs.readFile(PRODUCTS_JSON, "utf-8");
  return JSON.parse(raw);
}

async function writeData(data: Record<string, unknown>) {
  await fs.writeFile(PRODUCTS_JSON, JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await readData();
  return NextResponse.json(data.categories || []);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, slug, description, image, premium } = body;

  if (!name || !slug) return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });

  const data = await readData();
  const exists = data.categories.find((c: { id: string }) => c.id === slug);
  if (exists) return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 });

  data.categories.push({
    id: slug,
    name,
    slug,
    description: description || "",
    image: image || `/images/categories/${slug}.jpg`,
    premium: premium || false,
  });

  await writeData(data);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, name, description, premium } = body;

  const data = await readData();
  const cat = data.categories.find((c: { id: string }) => c.id === id);
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  if (name) cat.name = name;
  if (description !== undefined) cat.description = description;
  if (premium !== undefined) cat.premium = premium;

  await writeData(data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();

  const data = await readData();
  data.categories = data.categories.filter((c: { id: string }) => c.id !== id);
  await writeData(data);
  return NextResponse.json({ success: true });
}
