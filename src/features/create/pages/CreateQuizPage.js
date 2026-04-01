"use client";

import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const emptyQuestion = {
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

// Animation Variants (Strictly Opacity and Translate/Scale, No Blur)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "tween", ease: "easeOut", duration: 0.25 } },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.2 } },
};

const workspaceVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "tween", ease: "easeOut", duration: 0.25 } },
};

const inputFocusProps = {
  whileFocus: { scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 25 } },
};

export default function CreateQuizPage() {
  const [folders, setFolders] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizDetail, setQuizDetail] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [savingFolder, setSavingFolder] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder._id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const selectedQuiz = useMemo(
    () => quizzes.find((quiz) => quiz._id === selectedQuizId) || null,
    [quizzes, selectedQuizId]
  );

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load folders.");
      }
      setFolders(data.folders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFolders(false);
    }
  };

  const loadQuizzes = async (folderId) => {
    if (!folderId) {
      setQuizzes([]);
      setSelectedQuizId("");
      setQuizDetail(null);
      return;
    }

    setLoadingQuizzes(true);
    try {
      const res = await fetch(`/api/quizzes?folderId=${folderId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load quizzes.");
      }
      const nextQuizzes = data.quizzes || [];
      setQuizzes(nextQuizzes);
      setSelectedQuizId((current) => {
        if (current && nextQuizzes.some((quiz) => quiz._id === current)) {
          return current;
        }
        return nextQuizzes[0]?._id || "";
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const loadQuiz = async (quizId) => {
    if (!quizId) {
      setQuizDetail(null);
      return;
    }

    setLoadingQuiz(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load quiz.");
      }
      setQuizDetail(data.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQuiz(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    setSelectedQuizId("");
    setQuizDetail(null);
    loadQuizzes(selectedFolderId);
  }, [selectedFolderId]);

  useEffect(() => {
    loadQuiz(selectedQuizId);
  }, [selectedQuizId]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setSavingFolder(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create folder.");
      }

      setFolderName("");
      setNotice(data.created === false ? "Folder already exists. Using the saved folder." : "Folder saved.");
      setFolders((current) => {
        if (current.some((folder) => folder._id === data.folder._id)) {
          return current.map((folder) => (folder._id === data.folder._id ? data.folder : folder));
        }
        return [data.folder, ...current];
      });
      setSelectedFolderId(data.folder._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingFolder(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedFolderId) return;

    setSavingQuiz(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: selectedFolderId, title: quizTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create quiz.");
      }

      setQuizTitle("");
      setNotice(data.created === false ? "Quiz already exists. It is selected below." : "Quiz saved.");
      setQuizzes((current) => {
        if (current.some((quiz) => quiz._id === data.quiz._id)) {
          return current.map((quiz) => (quiz._id === data.quiz._id ? data.quiz : quiz));
        }
        return [data.quiz, ...current];
      });
      setSelectedQuizId(data.quiz._id);
      setQuizDetail(data.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleQuestionChange = (index, value) => {
    setQuestionForm((current) => {
      const nextOptions = [...current.options];
      nextOptions[index] = value;
      return { ...current, options: nextOptions };
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    setSavingQuestion(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch(`/api/quizzes/${selectedQuizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save question.");
      }

      setQuestionForm(emptyQuestion);
      setNotice("Question saved to the quiz.");
      setQuizDetail(data.quiz);
      setQuizzes((current) =>
        current.map((quiz) =>
          quiz._id === data.quiz._id ? { ...quiz, questions: data.quiz.questions } : quiz
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingQuestion(false);
    }
  };

  return (
    <main className="main-container">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Overrides to entirely remove blur and enforce solid contrast colors */
        
        .main-container {
          background-color: var(--bg-color) !important;
          /* Strip all inherited blurs globally across this document instance */
          filter: none !important;
          backdrop-filter: none !important;
        }
        [data-theme="light"] .main-container {
          background-color: #f1f5f9 !important; /* Soft light backdrop */
        }
      
        /* Ensure cards are solid, fully opaque, sharp, and have definitive soft shadows */
        .quiz-generator, .question-card {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
          background-color: #1e293b !important;
          border: 1px solid #334155 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1) !important;
          color: #f8fafc !important; /* Force stark white text naturally */
          text-shadow: none !important; /* Disable any text glows/blurs */
        }
        
        [data-theme="light"] .quiz-generator,
        [data-theme="light"] .question-card {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05) !important;
          color: #0f172a !important; /* Stark dark slate text */
        }
      
        /* Inputs must be solid and sharp */
        .form-group input, .form-group textarea, .form-group select {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
          text-shadow: none !important;
          background-color: #0f172a !important;
          border: 1px solid #475569 !important;
          color: #f8fafc !important;
        }
        
        [data-theme="light"] .form-group input, 
        [data-theme="light"] .form-group textarea, 
        [data-theme="light"] .form-group select {
          background-color: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02) !important;
        }
      
        /* Interactive List items (Folders and Quizzes) */
        .options-list .option {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
          background-color: #0f172a !important;
          border: 1px solid #334155 !important;
          color: #f8fafc !important;
          text-shadow: none !important; /* Enforce crystal clear sharpness */
        }
        
        [data-theme="light"] .options-list .option {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          color: #1e293b !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
        }
        
        [data-theme="light"] .options-list .option:hover {
          background-color: #f8fafc !important;
        }
      
        [data-theme="light"] .options-list .option.correct {
          background-color: #3b82f6 !important;
          color: white !important;
          border-color: #2563eb !important;
        }

        .options-list .option.correct {
          background-color: #3b82f6 !important;
          color: white !important;
          border-color: #2563eb !important;
        }
      
        /* Ensure primary buttons are vividly visible and non-disabled looking */
        .generate-btn {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
          text-shadow: none !important;
          opacity: 1 !important;
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%) !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
          border: none !important;
        }
        
        .generate-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }
        
        /* Font legibility fixes for Themes */
        .panel-subtitle, .empty-state {
          color: #94a3b8 !important;
          text-shadow: none !important;
        }

        [data-theme="light"] .panel-subtitle, 
        [data-theme="light"] .empty-state {
          color: #64748b !important;
        }
        
        [data-theme="light"] .header p {
          color: #475569 !important;
        }
        
        [data-theme="light"] label {
          color: #334155 !important;
          font-weight: 600 !important;
        }

        /* Prevent anti-aliasing blurring issues on transforms */
        .quiz-generator, .option, .generate-btn, .question-card {
           transform: translateZ(0); 
           -webkit-font-smoothing: antialiased;
           -moz-osx-font-smoothing: grayscale;
        }
      `}} />
      <ThemeToggle />
      <div className="page-shell with-navbar">
        <motion.div 
          className="content"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.header className="header" variants={itemVariants}>
          <h1 style={{ textShadow: 'none', filter: 'none' }}>Create Quizzes</h1>
          <p>Organize folders, create quizzes inside them, and save every question into PostgreSQL.</p>
        </motion.header>

        <motion.section 
          className="quiz-generator"
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
        >
          <div className="form-group">
            <label htmlFor="folderName">New folder</label>
            <motion.input
              id="folderName"
              type="text"
              placeholder="e.g. Science Grade 10"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              disabled={savingFolder}
              {...inputFocusProps}
            />
          </div>
          <motion.button 
            type="button" 
            className="generate-btn" 
            onClick={handleCreateFolder} 
            disabled={savingFolder || !folderName.trim()}
            whileHover={!(savingFolder || !folderName.trim()) ? { scale: 1.02 } : {}}
            whileTap={!(savingFolder || !folderName.trim()) ? { scale: 0.97 } : {}}
          >
            {savingFolder ? "Saving..." : "Create Folder"}
          </motion.button>

          <div className="form-group">
            <label>Folders</label>
            <motion.div className="options-list" variants={listContainerVariants} initial="hidden" animate="show">
              {loadingFolders && <div className="empty-state">Loading folders...</div>}
              {!loadingFolders && folders.length === 0 && (
                <div className="empty-state">No folders yet. Create one to start organizing quizzes.</div>
              )}
              {folders.map((folder) => {
                const isSelected = folder._id === selectedFolderId;
                return (
                  <motion.button
                    key={folder._id}
                    variants={listItemVariants}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className={isSelected ? "option correct scale-105" : "option"}
                    onClick={() => setSelectedFolderId(folder._id)}
                    style={{ transformOrigin: "left center", transition: "transform 0.2s, background-color 0.2s" }}
                  >
                    <span className="option-text">{folder.name}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          <div className="form-group">
            <label htmlFor="quizTitle">New quiz title</label>
            <motion.input
              id="quizTitle"
              type="text"
              placeholder="e.g. Cell Biology Basics"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              disabled={!selectedFolderId || savingQuiz}
              {...inputFocusProps}
            />
          </div>
          <motion.button
            type="button"
            className="generate-btn"
            onClick={handleCreateQuiz}
            disabled={!selectedFolderId || savingQuiz || !quizTitle.trim()}
            whileHover={!(!selectedFolderId || savingQuiz || !quizTitle.trim()) ? { scale: 1.02 } : {}}
            whileTap={!(!selectedFolderId || savingQuiz || !quizTitle.trim()) ? { scale: 0.97 } : {}}
          >
            {savingQuiz ? "Saving..." : "Create Quiz"}
          </motion.button>

          <div className="form-group">
            <label>Quizzes</label>
            <motion.div className="options-list" variants={listContainerVariants} initial="hidden" animate="show">
              {selectedFolderId && loadingQuizzes && <div className="empty-state">Loading quizzes...</div>}
              {selectedFolderId && !loadingQuizzes && quizzes.length === 0 && (
                <div className="empty-state">This folder has no quizzes yet.</div>
              )}
              {quizzes.map((quiz) => {
                const isSelected = quiz._id === selectedQuizId;
                return (
                  <motion.button
                    key={quiz._id}
                    variants={listItemVariants}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className={isSelected ? "option correct scale-105" : "option"}
                    onClick={() => setSelectedQuizId(quiz._id)}
                    style={{ transformOrigin: "left center", transition: "transform 0.2s, background-color 0.2s" }}
                  >
                    <span className="option-text">{quiz.title}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="quiz-generator"
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
        >
          <div className="form-group">
            <label>Workspace</label>
            <p className="panel-subtitle">
              {selectedFolder && selectedQuiz
                ? `${selectedFolder.name} / ${selectedQuiz.title}`
                : "Pick a folder and quiz to start adding questions."}
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {selectedFolder && selectedQuiz && (
              <motion.div
                key="workspace-content"
                variants={workspaceVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <form onSubmit={handleSaveQuestion}>
                  <div className="form-group">
                    <label htmlFor="question">Question</label>
                    <motion.textarea
                      id="question"
                      value={questionForm.question}
                      onChange={(e) =>
                        setQuestionForm((current) => ({
                          ...current,
                          question: e.target.value,
                        }))
                      }
                      placeholder="Type the question here..."
                      disabled={!selectedQuizId || savingQuestion}
                      {...inputFocusProps}
                    />
                  </div>

                  <div className="question-options-grid">
                    {questionForm.options.map((option, index) => (
                      <div className="form-group" key={index}>
                        <label htmlFor={`option-${index}`}>Option {index + 1}</label>
                        <motion.input
                          id={`option-${index}`}
                          type="text"
                          value={option}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          disabled={!selectedQuizId || savingQuestion}
                          {...inputFocusProps}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label htmlFor="correctIndex">Correct option</label>
                    <motion.select
                      id="correctIndex"
                      value={questionForm.correctIndex}
                      onChange={(e) =>
                        setQuestionForm((current) => ({
                          ...current,
                          correctIndex: Number(e.target.value),
                        }))
                      }
                      disabled={!selectedQuizId || savingQuestion}
                      {...inputFocusProps}
                    >
                      {questionForm.options.map((option, index) => (
                        <option key={index} value={index}>
                          Option {index + 1}
                          {option ? ` - ${option}` : ""}
                        </option>
                      ))}
                    </motion.select>
                  </div>

                  <motion.button 
                    type="submit" 
                    className="generate-btn" 
                    disabled={!selectedQuizId || savingQuestion}
                    whileHover={!(!selectedQuizId || savingQuestion) ? { scale: 1.02 } : {}}
                    whileTap={!(!selectedQuizId || savingQuestion) ? { scale: 0.97 } : {}}
                  >
                    {savingQuestion ? "Saving Question..." : "Save Question"}
                  </motion.button>
                </form>

                <div className="results-container">
                  {loadingQuiz && <div className="empty-state">Loading quiz...</div>}
                  {!loadingQuiz && quizDetail?.questions?.length === 0 && (
                    <div className="empty-state">No questions saved for this quiz yet.</div>
                  )}
                  <AnimatePresence>
                    {quizDetail?.questions?.map((question, index) => (
                      <motion.div 
                        key={`${question.question}-${index}`} 
                        className="question-card saved-question-card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
                        whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                      >
                        <h3>Question {index + 1}</h3>
                        <p className="question-text">{question.question}</p>
                        <div className="options-list">
                          {question.options.map((option, optionIndex) => {
                            const isCorrect = optionIndex === question.correctIndex;
                            const letter = String.fromCharCode(65 + optionIndex);
                            return (
                              <div key={optionIndex} className={isCorrect ? "option correct" : "option"}>
                                <span className="option-letter">{letter}</span>
                                <span className="option-text">{option}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <AnimatePresence>
          {notice && (
            <motion.div 
              className="notice-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {notice}
            </motion.div>
          )}
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}





