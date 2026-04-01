"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/layout/ThemeToggle";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: "easeOut" } },
};

function getQuestionCorrectIndex(question) {
  if (typeof question.correctIndex === "number") {
    return question.correctIndex;
  }

  if (question.correctAnswer && Array.isArray(question.options)) {
    return question.options.findIndex((option) => option === question.correctAnswer);
  }

  return -1;
}

export default function AttendQuizPage({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadQuiz() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load quiz.");
        }

        if (isMounted) {
          setQuiz(data.quiz || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load quiz.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [quizId]);

  const questionCount = quiz?.questions?.length || 0;

  const results = useMemo(() => {
    if (!quiz?.questions?.length) {
      return { correctCount: 0, percentage: 0 };
    }

    const correctCount = quiz.questions.reduce((count, question, index) => {
      const selectedIndex = answers[index];
      const correctIndex = getQuestionCorrectIndex(question);
      return count + (selectedIndex === correctIndex ? 1 : 0);
    }, 0);

    return {
      correctCount,
      percentage: Math.round((correctCount / quiz.questions.length) * 100),
    };
  }, [answers, quiz]);

  const answeredCount = Object.keys(answers).length;
  const canSubmit = questionCount > 0 && answeredCount === questionCount && !isSubmitted;

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (isSubmitted) return;

    setAnswers((current) => ({
      ...current,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="main-container">
      <ThemeToggle />
      <div className="page-shell with-navbar">
        <motion.div className="content" variants={pageVariants} initial="hidden" animate="show">
          <motion.header className="header" variants={itemVariants}>
            <h1>{quiz?.title || "Attend Quiz"}</h1>
            {quiz?.folder?.description ? <p>{quiz.folder.description}</p> : null}
          </motion.header>

          {loading ? (
            <motion.div className="quiz-generator" variants={itemVariants}>
              <div className="empty-state">Loading quiz...</div>
            </motion.div>
          ) : null}

          {error ? (
            <motion.div className="error-message" variants={itemVariants}>
              {error}
            </motion.div>
          ) : null}

          {!loading && !error && quiz && questionCount === 0 ? (
            <motion.div className="quiz-generator" variants={itemVariants}>
              <div className="empty-state">This quiz does not have any questions yet.</div>
            </motion.div>
          ) : null}

          {!loading && !error && quiz && questionCount > 0 ? (
            <>
              <AnimatePresence>
                {isSubmitted ? (
                  <motion.section
                    className="quiz-generator attend-quiz-result"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <span className="attend-quiz-result-label">Final Score</span>
                    <h2>{results.correctCount}/{questionCount}</h2>
                    <p>{results.percentage}% correct</p>
                  </motion.section>
                ) : null}
              </AnimatePresence>

              <motion.section className="section-stack" variants={itemVariants}>
                <div className="attend-quiz-progress">
                  <span>{answeredCount}/{questionCount} answered</span>
                  <span>{isSubmitted ? "Answers locked" : "You can change answers before submitting"}</span>
                </div>

                <div className="section-stack">
                  {quiz.questions.map((question, questionIndex) => {
                    const selectedIndex = answers[questionIndex];
                    const correctIndex = getQuestionCorrectIndex(question);

                    return (
                      <motion.article
                        key={question.id || `${question.question}-${questionIndex}`}
                        className="question-card attend-quiz-card"
                        variants={itemVariants}
                      >
                        <div className="attend-quiz-question-meta">
                          <h3>Question {questionIndex + 1}</h3>
                          <span>{selectedIndex === undefined ? "Not answered" : "Answered"}</span>
                        </div>
                        <p className="question-text">{question.question}</p>

                        <div className="attend-quiz-options">
                          {question.options.map((option, optionIndex) => {
                            const letter = String.fromCharCode(65 + optionIndex);
                            const isSelected = selectedIndex === optionIndex;
                            const isCorrect = isSubmitted && optionIndex === correctIndex;
                            const isWrongSelection = isSubmitted && isSelected && optionIndex !== correctIndex;

                            const stateClass = isCorrect
                              ? "is-correct"
                              : isWrongSelection
                                ? "is-wrong"
                                : isSelected
                                  ? "is-selected"
                                  : "";

                            return (
                              <button
                                key={`${questionIndex}-${optionIndex}`}
                                type="button"
                                className={`attend-quiz-option ${stateClass}`.trim()}
                                onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                                disabled={isSubmitted}
                              >
                                <span className="attend-quiz-option-letter">{letter}</span>
                                <span className="attend-quiz-option-text">{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                <div className="attend-quiz-actions">
                  {!isSubmitted ? (
                    <button type="button" className="generate-btn attend-quiz-submit" disabled={!canSubmit} onClick={handleSubmit}>
                      Submit Quiz
                    </button>
                  ) : (
                    <div className="notice-message">
                      Review complete. Correct answers are highlighted in green and incorrect selections in red.
                    </div>
                  )}
                </div>
              </motion.section>
            </>
          ) : null}
        </motion.div>
      </div>
    </main>
  );
}


