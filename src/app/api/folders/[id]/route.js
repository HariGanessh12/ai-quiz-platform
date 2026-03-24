import { NextResponse } from "next/server";
import { deleteFolder, getFolderById, updateFolder } from "@/server/repositories/folders";
import { isUuid } from "@/server/db/postgres";

export async function GET(_, { params }) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "A valid folder id is required." }, { status: 400 });
    }

    const folder = await getFolderById(id);
    if (!folder) {
      return NextResponse.json({ success: false, error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: folder, folder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, description = "" } = await req.json();

    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "A valid folder id is required." }, { status: 400 });
    }

    const trimmedName = name?.trim();
    if (!trimmedName) {
      return NextResponse.json({ success: false, error: "Folder name is required." }, { status: 400 });
    }

    const folder = await updateFolder({ id, name: trimmedName, description });
    if (!folder) {
      return NextResponse.json({ success: false, error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: folder, folder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "A valid folder id is required." }, { status: 400 });
    }

    const deleted = await deleteFolder(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
