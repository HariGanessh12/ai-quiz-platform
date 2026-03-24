import { NextResponse } from "next/server";
import { createFolder, getFolderBySlug, listFolders } from "@/server/repositories/folders";
import { toSlug } from "@/server/utils/slug";

export async function GET() {
  try {
    const folders = await listFolders();
    return NextResponse.json({ success: true, count: folders.length, data: folders, folders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, description = "" } = await req.json();
    const trimmedName = name?.trim();
    const trimmedDescription = description?.trim() || "";

    if (!trimmedName) {
      return NextResponse.json({ success: false, error: "Folder name is required." }, { status: 400 });
    }

    const slug = toSlug(trimmedName);
    if (!slug) {
      return NextResponse.json({ success: false, error: "Folder name must contain letters or numbers." }, { status: 400 });
    }

    const existingFolder = await getFolderBySlug(slug);
    if (existingFolder) {
      return NextResponse.json({ success: true, data: existingFolder, folder: existingFolder, created: false });
    }

    const folder = await createFolder({ name: trimmedName, slug, description: trimmedDescription });
    return NextResponse.json({ success: true, data: folder, folder, created: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
