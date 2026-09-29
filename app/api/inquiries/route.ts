import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_PATH = "data/inquiries.json";

async function getInquiries(): Promise<Record<string, unknown>[]> {
  const { data } = await supabase.storage
    .from("product-images")
    .download(STORAGE_PATH);

  if (!data) return [];
  try {
    const text = await data.text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function saveInquiries(inquiries: Record<string, unknown>[]) {
  const blob = new Blob([JSON.stringify(inquiries, null, 2)], { type: "application/json" });
  await supabase.storage
    .from("product-images")
    .upload(STORAGE_PATH, blob, { contentType: "application/json", upsert: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    const inquiry = {
      id: Date.now(),
      name,
      email: email || null,
      phone: phone || null,
      message,
      created_at: new Date().toISOString(),
      read: false,
    };

    const inquiries = await getInquiries();
    inquiries.unshift(inquiry);
    await saveInquiries(inquiries);

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch {
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-key");
  if (authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await getInquiries();
  return NextResponse.json(inquiries);
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-key");
  if (authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  const inquiries = await getInquiries();
  const filtered = inquiries.filter((i) => (i as { id: number }).id !== id);
  await saveInquiries(filtered);

  return NextResponse.json({ success: true });
}
