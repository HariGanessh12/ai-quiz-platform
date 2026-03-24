"use client";
import QuizGenerator from "@/features/generator/components/QuizGenerator";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/layout/ThemeToggle";

const ThreeBackground = dynamic(() => import("@/components/layout/ThreeBackground"), {
  ssr: false,
});

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

