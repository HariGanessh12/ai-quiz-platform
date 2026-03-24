import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Folder from "@/models/Folder";

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    await connectMongo();
    const folders = await Folder.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ folders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const { name } = await req.json();
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return NextResponse.json({ error: "Folder name is required." }, { status: 400 });
    }

    const slug = toSlug(trimmedName);
    if (!slug) {
      return NextResponse.json({ error: "Folder name must contain letters or numbers." }, { status: 400 });
    }

    const existing = await Folder.findOne({ slug });
    if (existing) {
      return NextResponse.json({ folder: existing, created: false });
    }

    const folder = await Folder.create({ name: trimmedName, slug });
    return NextResponse.json({ folder, created: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
