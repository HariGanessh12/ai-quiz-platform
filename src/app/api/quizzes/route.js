import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongodb";
import Folder from "@/models/Folder";
import Quiz from "@/models/Quiz";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json({ error: "A valid folderId is required." }, { status: 400 });
    }

    const quizzes = await Quiz.find({ folderId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ quizzes });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const { folderId, title } = await req.json();
    const trimmedTitle = title?.trim();

    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json({ error: "A valid folderId is required." }, { status: 400 });
    }

    if (!trimmedTitle) {
      return NextResponse.json({ error: "Quiz title is required." }, { status: 400 });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    }

    const existing = await Quiz.findOne({ folderId, title: trimmedTitle });
    if (existing) {
      return NextResponse.json({ quiz: existing, created: false });
    }

    const quiz = await Quiz.create({ folderId, title: trimmedTitle });
    return NextResponse.json({ quiz, created: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
