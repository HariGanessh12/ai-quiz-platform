import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Folder from '@/models/Folder';
import Quiz from '@/models/Quiz';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    await dbConnect();
    const folder = await Folder.findById(id);
    if (!folder) {
      return NextResponse.json({ success: false, error: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: folder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    await dbConnect();
    const body = await request.json();
    const folder = await Folder.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!folder) {
      return NextResponse.json({ success: false, error: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: folder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await dbConnect();
    // Also delete all quizzes inside this folder
    await Quiz.deleteMany({ folderId: id });
    const deletedFolder = await Folder.findByIdAndDelete(id);
    if (!deletedFolder) {
      return NextResponse.json({ success: false, error: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
