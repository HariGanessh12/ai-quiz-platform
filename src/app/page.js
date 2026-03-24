import QuizGenerator from "@/components/QuizGenerator";
import ThreeBackground from "@/components/ThreeBackground";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="main-container">
      <ThreeBackground />
      <ThemeToggle />
      <div className="content">
        <header className="header">
          <h1>AI Quiz Generator</h1>
          <p>Generate high-quality questions for any topic using the power of Google Gemini & Groq.</p>
        </header>
        <QuizGenerator />
      </div>
    </main>
  );
}
