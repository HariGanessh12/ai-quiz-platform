import AttendQuizPage from "@/features/quiz/pages/AttendQuizPage";

export default async function Page({ params }) {
  const { quizId } = await params;
  return <AttendQuizPage quizId={quizId} />;
}
