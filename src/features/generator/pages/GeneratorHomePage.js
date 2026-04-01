"use client";
import QuizGenerator from "@/features/generator/components/QuizGenerator";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Home() {
  return (
    <main className="main-container">
      <ThemeToggle />
      <div className="page-shell with-navbar">
        <div className="content">
          <header className="header">
            <h1>AI Quiz Generator</h1>
            <p>Generate high-quality questions for any topic using the power of Google Gemini & Groq.</p>
          </header>
          <QuizGenerator />
        </div>
      </div>
    </main>
  );
}


