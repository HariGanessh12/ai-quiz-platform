import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";

export async function POST(req, { params }) {
  try {
    await connectMongo();
    const { quizId } = await params;
    const { question, options, correctIndex } = await req.json();

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "A valid quizId is required." }, { status: 400 });
    }

    const trimmedQuestion = question?.trim();
    const cleanedOptions = Array.isArray(options)
      ? options.map((option) => option?.trim()).filter(Boolean)
      : [];
    const parsedCorrectIndex = Number(correctIndex);

    if (!trimmedQuestion) {
      return NextResponse.json({ error: "Question text is required." }, { status: 400 });
    }

    if (cleanedOptions.length !== 4) {
      return NextResponse.json({ error: "Please provide exactly four options." }, { status: 400 });
    }

    if (!Number.isInteger(parsedCorrectIndex) || parsedCorrectIndex < 0 || parsedCorrectIndex > 3) {
      return NextResponse.json({ error: "Choose a valid correct option." }, { status: 400 });
    }

    const correctAnswer = cleanedOptions[parsedCorrectIndex];

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        $push: {
          questions: {
            question: trimmedQuestion,
            options: cleanedOptions,
            correctIndex: parsedCorrectIndex,
            correctAnswer,
          },
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    return NextResponse.json({ quiz, created: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

