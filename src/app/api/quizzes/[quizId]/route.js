import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";

export async function GET(_, { params }) {
  try {
    await connectMongo();
    const { quizId } = await params;

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "A valid quizId is required." }, { status: 400 });
    }

    const quiz = await Quiz.findById(quizId).populate("folderId", "name slug").lean();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

