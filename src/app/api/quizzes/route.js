import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    const query = { userId: 'dummy_user_123' };
    if (folderId) {
      query.folderId = folderId;
    }
    
    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const quiz = await Quiz.create(body);
    return NextResponse.json({ success: true, data: quiz }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
