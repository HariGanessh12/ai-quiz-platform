"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/layout/ThemeToggle";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut", staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: "easeOut" } },
};

export default function QuizBrowserPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQuizzes() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/quizzes");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load quizzes.");
        }

        if (isMounted) {
          setQuizzes(data.quizzes || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load quizzes.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQuizzes();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return quizzes;

    return quizzes.filter((quiz) => {
      const title = quiz.title?.toLowerCase() || "";
      const folderName = quiz.folder?.name?.toLowerCase() || "";
      return title.includes(query) || folderName.includes(query);
    });
  }, [quizzes, searchQuery]);

  return (
    <main className="main-container">
      <ThemeToggle />
      <div className="page-shell with-navbar">
        <motion.div className="page-content" variants={pageVariants} initial="hidden" animate="show">
          <motion.header className="header" variants={itemVariants}>
            <h1>Attend Quiz</h1>
            <p>Browse all created quizzes, pick one, and start answering right away.</p>
          </motion.header>

          <motion.section className="quiz-generator" variants={itemVariants}>
            <div className="form-group">
              <label htmlFor="quiz-search">Search quizzes</label>
              <input
                id="quiz-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by quiz title or folder name"
              />
            </div>
          </motion.section>

          {loading ? (
            <motion.section className="quiz-generator" variants={itemVariants}>
              <div className="empty-state">Loading quizzes...</div>
            </motion.section>
          ) : null}

          {error ? (
            <motion.div className="error-message" variants={itemVariants}>{error}</motion.div>
          ) : null}

          {!loading && !error ? (
            <motion.section className="quiz-browser-grid" variants={itemVariants}>
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <motion.article key={quiz._id} className="question-card quiz-browser-card" variants={itemVariants}>
                    <div className="quiz-browser-card-meta">
                      <span>{quiz.folder?.name || "Uncategorized"}</span>
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                    <h3 className="quiz-browser-card-title">{quiz.title}</h3>
                    <p className="quiz-browser-card-description">
                      {quiz.folder?.description || "Choose this quiz to begin your attempt and review your score at the end."}
                    </p>
                    <button type="button" className="generate-btn quiz-browser-link" onClick={() => setSelectedQuiz(quiz)}>
                      Start Quiz
                    </button>
                  </motion.article>
                ))
              ) : (
                <div className="quiz-generator">
                  <div className="empty-state">No quizzes matched your search.</div>
                </div>
              )}
            </motion.section>
          ) : null}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedQuiz ? (
          <div className="quiz-confirm-overlay" onClick={() => setSelectedQuiz(null)}>
            <motion.div
              className="quiz-confirm-modal"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <span className="quiz-confirm-kicker">Ready to begin?</span>
              <h2>{selectedQuiz.title}</h2>
              <p className="quiz-confirm-subtitle">
                {selectedQuiz.folder?.name || "Uncategorized"}
                {selectedQuiz.folder?.description ? ` | ${selectedQuiz.folder.description}` : ""}
              </p>
              <div className="quiz-confirm-stats">
                <span>{selectedQuiz.questions?.length || 0} questions</span>
                <span>Single-question mode</span>
              </div>
              <div className="quiz-confirm-actions">
                <button type="button" className="quiz-confirm-cancel" onClick={() => setSelectedQuiz(null)}>
                  Cancel
                </button>
                <Link href={`/quiz/${selectedQuiz._id}`} className="generate-btn quiz-confirm-start">
                  Start Quiz
                </Link>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
