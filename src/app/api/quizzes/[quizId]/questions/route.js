import { NextResponse } from "next/server";
import { isUuid } from "@/server/db/postgres";
import { addQuestionToQuiz, getQuizById, quizExists } from "@/server/repositories/quizzes";

export async function POST(req, { params }) {
  try {
    const { quizId } = await params;
    const { question, options, correctIndex } = await req.json();

    if (!quizId || !isUuid(quizId)) {
      return NextResponse.json({ success: false, error: "A valid quizId is required." }, { status: 400 });
    }

    const trimmedQuestion = question?.trim();
    const cleanedOptions = Array.isArray(options)
      ? options.map((option) => option?.trim()).filter(Boolean)
      : [];
    const parsedCorrectIndex = Number(correctIndex);

    if (!trimmedQuestion) {
      return NextResponse.json({ success: false, error: "Question text is required." }, { status: 400 });
    }

    if (cleanedOptions.length !== 4) {
      return NextResponse.json({ success: false, error: "Please provide exactly four options." }, { status: 400 });
    }

    if (!Number.isInteger(parsedCorrectIndex) || parsedCorrectIndex < 0 || parsedCorrectIndex > 3) {
      return NextResponse.json({ success: false, error: "Choose a valid correct option." }, { status: 400 });
    }

    const exists = await quizExists(quizId);
    if (!exists) {
      return NextResponse.json({ success: false, error: "Quiz not found." }, { status: 404 });
    }

    const quiz = await addQuestionToQuiz({
      quizId,
      question: trimmedQuestion,
      options: cleanedOptions,
      correctIndex: parsedCorrectIndex,
      correctAnswer: cleanedOptions[parsedCorrectIndex],
    });

    return NextResponse.json({ success: true, data: quiz, quiz, created: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
