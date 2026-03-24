import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Folder from '@/models/Folder';

export async function GET() {
  try {
    await dbConnect();
    const folders = await Folder.find({ userId: 'dummy_user_123' }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: folders.length, data: folders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const folder = await Folder.create(body);
    return NextResponse.json({ success: true, data: folder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
