import { NextResponse } from "next/server";
import { isUuid } from "@/server/db/postgres";
import { createQuiz, getExistingQuiz, listAllQuizzes, listQuizzesByFolderId } from "@/server/repositories/quizzes";
import { getFolderById } from "@/server/repositories/folders";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      const quizzes = await listAllQuizzes();
      return NextResponse.json({ success: true, count: quizzes.length, data: quizzes, quizzes });
    }

    if (!isUuid(folderId)) {
      return NextResponse.json({ success: false, error: "A valid folderId is required." }, { status: 400 });
    }

    const quizzes = await listQuizzesByFolderId(folderId);
    return NextResponse.json({ success: true, count: quizzes.length, data: quizzes, quizzes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { folderId, title } = await req.json();
    const trimmedTitle = title?.trim();

    if (!folderId || !isUuid(folderId)) {
      return NextResponse.json({ success: false, error: "A valid folderId is required." }, { status: 400 });
    }

    if (!trimmedTitle) {
      return NextResponse.json({ success: false, error: "Quiz title is required." }, { status: 400 });
    }

    const folder = await getFolderById(folderId);
    if (!folder) {
      return NextResponse.json({ success: false, error: "Folder not found." }, { status: 404 });
    }

    const existingQuiz = await getExistingQuiz({ folderId, title: trimmedTitle });
    if (existingQuiz) {
      return NextResponse.json({ success: true, data: existingQuiz, quiz: existingQuiz, created: false });
    }

    const quiz = await createQuiz({ folderId, title: trimmedTitle });
    return NextResponse.json({ success: true, data: quiz, quiz, created: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
