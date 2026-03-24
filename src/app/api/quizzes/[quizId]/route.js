import { NextResponse } from "next/server";
import { isUuid } from "@/server/db/postgres";
import { deleteQuiz, getQuizById } from "@/server/repositories/quizzes";

export async function GET(_, { params }) {
  try {
    const { quizId } = await params;

    if (!quizId || !isUuid(quizId)) {
      return NextResponse.json({ success: false, error: "A valid quizId is required." }, { status: 400 });
    }

    const quiz = await getQuizById(quizId);
    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quiz, quiz });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const { quizId } = await params;

    if (!quizId || !isUuid(quizId)) {
      return NextResponse.json({ success: false, error: "A valid quiz id is required." }, { status: 400 });
    }

    const deleted = await deleteQuiz(quizId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
