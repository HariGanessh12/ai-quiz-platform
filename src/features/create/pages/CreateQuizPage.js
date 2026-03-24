"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";

const ThreeBackground = dynamic(() => import("@/components/layout/ThreeBackground"), {
  ssr: false,
});

const emptyQuestion = {
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
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
      <ThreeBackground />
      <ThemeToggle />
      <div className="content">
        <header className="header">
          <h1>Create Quizzes</h1>
          <p>Organize folders, create quizzes inside them, and save every question into PostgreSQL.</p>
        </header>

        <section className="quiz-generator">
          <div className="form-group">
            <label htmlFor="folderName">New folder</label>
            <input
              id="folderName"
              type="text"
              placeholder="e.g. Science Grade 10"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              disabled={savingFolder}
            />
          </div>
          <button type="button" className="generate-btn" onClick={handleCreateFolder} disabled={savingFolder || !folderName.trim()}>
            {savingFolder ? "Saving..." : "Create Folder"}
          </button>

          <div className="form-group">
            <label>Folders</label>
            <div className="options-list">
              {loadingFolders && <div className="empty-state">Loading folders...</div>}
              {!loadingFolders && folders.length === 0 && (
                <div className="empty-state">No folders yet. Create one to start organizing quizzes.</div>
              )}
              {folders.map((folder) => (
                <button
                  key={folder._id}
                  type="button"
                  className={folder._id === selectedFolderId ? "option correct" : "option"}
                  onClick={() => setSelectedFolderId(folder._id)}
                >
                  <span className="option-text">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="quizTitle">New quiz title</label>
            <input
              id="quizTitle"
              type="text"
              placeholder="e.g. Cell Biology Basics"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              disabled={!selectedFolderId || savingQuiz}
            />
          </div>
          <button
            type="button"
            className="generate-btn"
            onClick={handleCreateQuiz}
            disabled={!selectedFolderId || savingQuiz || !quizTitle.trim()}
          >
            {savingQuiz ? "Saving..." : "Create Quiz"}
          </button>

          <div className="form-group">
            <label>Quizzes</label>
            <div className="options-list">
              {selectedFolderId && loadingQuizzes && <div className="empty-state">Loading quizzes...</div>}
              {selectedFolderId && !loadingQuizzes && quizzes.length === 0 && (
                <div className="empty-state">This folder has no quizzes yet.</div>
              )}
              {quizzes.map((quiz) => (
                <button
                  key={quiz._id}
                  type="button"
                  className={quiz._id === selectedQuizId ? "option correct" : "option"}
                  onClick={() => setSelectedQuizId(quiz._id)}
                >
                  <span className="option-text">{quiz.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="quiz-generator">
          <div className="form-group">
            <label>Workspace</label>
            <p className="panel-subtitle">
              {selectedFolder && selectedQuiz
                ? `${selectedFolder.name} / ${selectedQuiz.title}`
                : "Pick a folder and quiz to start adding questions."}
            </p>
          </div>

          <form onSubmit={handleSaveQuestion}>
            <div className="form-group">
              <label htmlFor="question">Question</label>
              <textarea
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
              />
            </div>

            <div className="question-options-grid">
              {questionForm.options.map((option, index) => (
                <div className="form-group" key={index}>
                  <label htmlFor={`option-${index}`}>Option {index + 1}</label>
                  <input
                    id={`option-${index}`}
                    type="text"
                    value={option}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={!selectedQuizId || savingQuestion}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="correctIndex">Correct option</label>
              <select
                id="correctIndex"
                value={questionForm.correctIndex}
                onChange={(e) =>
                  setQuestionForm((current) => ({
                    ...current,
                    correctIndex: Number(e.target.value),
                  }))
                }
                disabled={!selectedQuizId || savingQuestion}
              >
                {questionForm.options.map((option, index) => (
                  <option key={index} value={index}>
                    Option {index + 1}
                    {option ? ` - ${option}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="generate-btn" disabled={!selectedQuizId || savingQuestion}>
              {savingQuestion ? "Saving Question..." : "Save Question"}
            </button>
          </form>

          <div className="results-container">
            {loadingQuiz && <div className="empty-state">Loading quiz...</div>}
            {!loadingQuiz && quizDetail?.questions?.length === 0 && (
              <div className="empty-state">No questions saved for this quiz yet.</div>
            )}
            {quizDetail?.questions?.map((question, index) => (
              <div key={`${question.question}-${index}`} className="question-card saved-question-card">
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
              </div>
            ))}
          </div>
        </section>

        {notice && <div className="notice-message">{notice}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </main>
  );
}


