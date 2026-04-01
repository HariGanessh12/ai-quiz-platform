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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
          setCurrentQuestionIndex(0);
          setAnswers({});
          setIsSubmitted(false);
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
  const currentQuestion = quiz?.questions?.[currentQuestionIndex] || null;

  const results = useMemo(() => {
    if (!quiz?.questions?.length) {
      return { correctCount: 0, percentage: 0, statuses: [] };
    }

    const statuses = quiz.questions.map((question, index) => {
      const selectedIndex = answers[index];
      const correctIndex = getQuestionCorrectIndex(question);
      return {
        index,
        isCorrect: selectedIndex === correctIndex,
      };
    });

    const correctCount = statuses.filter((item) => item.isCorrect).length;

    return {
      correctCount,
      percentage: Math.round((correctCount / quiz.questions.length) * 100),
      statuses,
    };
  }, [answers, quiz]);

  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === questionCount - 1;

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (isSubmitted) return;

    setAnswers((current) => ({
      ...current,
      [questionIndex]: optionIndex,
    }));
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((current) => Math.min(current + 1, questionCount - 1));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((current) => Math.max(current - 1, 0));
  };

  const handleSkip = () => {
    if (!isLastQuestion) {
      goToNextQuestion();
    }
  };

  const handleSubmit = () => {
    if (questionCount === 0) return;
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
            {quiz?.folder ? (
              <p>
                {quiz.folder.name}
                {quiz.folder.description ? ` | ${quiz.folder.description}` : ""}
              </p>
            ) : null}
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
                    <div className="attend-quiz-score-strip">
                      {results.statuses.map((item) => (
                        <span
                          key={item.index}
                          className={`attend-quiz-score-pill ${item.isCorrect ? "is-correct" : "is-wrong"}`}
                        >
                          {item.index + 1}
                        </span>
                      ))}
                    </div>
                  </motion.section>
                ) : null}
              </AnimatePresence>

              <motion.section className="section-stack" variants={itemVariants}>
                <div className="attend-quiz-progress">
                  <span>Question {currentQuestionIndex + 1} of {questionCount}</span>
                  <span>{answeredCount}/{questionCount} answered</span>
                </div>

                {currentQuestion ? (
                  <motion.article
                    key={currentQuestionIndex}
                    className="question-card attend-quiz-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <div className="attend-quiz-question-meta">
                      <h3>Question {currentQuestionIndex + 1}</h3>
                      <span>
                        {answers[currentQuestionIndex] === undefined ? "Not answered" : "Answered"}
                      </span>
                    </div>
                    <p className="question-text">{currentQuestion.question}</p>

                    <div className="attend-quiz-options">
                      {currentQuestion.options.map((option, optionIndex) => {
                        const letter = String.fromCharCode(65 + optionIndex);
                        const selectedIndex = answers[currentQuestionIndex];
                        const correctIndex = getQuestionCorrectIndex(currentQuestion);
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
                            key={`${currentQuestionIndex}-${optionIndex}`}
                            type="button"
                            className={`attend-quiz-option ${stateClass}`.trim()}
                            onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                            disabled={isSubmitted}
                          >
                            <span className="attend-quiz-option-letter">{letter}</span>
                            <span className="attend-quiz-option-text">{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.article>
                ) : null}

                <div className="attend-quiz-actions attend-quiz-actions--split">
                  <button
                    type="button"
                    className="quiz-nav-btn"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0 || isSubmitted}
                  >
                    Previous
                  </button>

                  {!isSubmitted && !isLastQuestion ? (
                    <div className="attend-quiz-action-group">
                      <button type="button" className="quiz-nav-btn" onClick={handleSkip}>
                        Skip
                      </button>
                      <button type="button" className="generate-btn attend-quiz-submit" onClick={goToNextQuestion}>
                        Next
                      </button>
                    </div>
                  ) : null}

                  {!isSubmitted && isLastQuestion ? (
                    <button type="button" className="generate-btn attend-quiz-submit" onClick={handleSubmit}>
                      Submit Quiz
                    </button>
                  ) : null}
                </div>
              </motion.section>
            </>
          ) : null}
        </motion.div>
      </div>
    </main>
  );
}
