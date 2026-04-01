"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";

const ThreeBackground = dynamic(() => import("@/components/layout/ThreeBackground"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="main-container">
      <ThreeBackground />
      <ThemeToggle />
      <div className="page-shell with-navbar relative">
        <div className="page-content page-content--narrow">
          <div className="relative z-10 section-stack text-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                AI Quiz Platform
              </h1>
              <p className="text-lg md:text-2xl text-[var(--text-muted)]">
                Your all-in-one platform for generating, managing, and taking quizzes powered by AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/generate" className="group relative w-full flex justify-center py-6 px-4 border text-lg font-medium rounded-2xl transition-all shadow-lg hover:scale-105 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-blue-500/10 dark:border-transparent dark:text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:shadow-blue-500/30">
                Generate Quiz
              </Link>
              
              <Link href="/create" className="group relative w-full flex justify-center py-6 px-4 border text-lg font-medium rounded-2xl transition-all shadow-lg hover:scale-105 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-purple-500/10 dark:border-transparent dark:text-white dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-500/30">
                Create Quiz
              </Link>
              
              <Link href="/dashboard" className="group relative w-full flex justify-center py-6 px-4 border text-lg font-medium rounded-2xl transition-all shadow-lg hover:scale-105 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-indigo-500/10 dark:border-transparent dark:text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/30">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


