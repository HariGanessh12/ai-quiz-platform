"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [count, setCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  const resultsRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count: parseInt(count) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate questions.");
      }

      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && resultsRef.current) {
      const cards = resultsRef.current.querySelectorAll('.question-card');
      gsap.fromTo(
        cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        }
      );
    }
  }, [questions]);

  return (
    <div>
      <form onSubmit={handleGenerate} className="quiz-generator">
        <div className="form-group">
          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            type="text"
            placeholder="e.g. Quantum Physics, History of Rome..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={loading}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="count">Number of Questions</label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            disabled={loading}
          >
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </div>

        <button type="submit" className="generate-btn" disabled={loading || !topic.trim()}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {questions.length > 0 && (
        <div className="results-container" ref={resultsRef}>
          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <h3>Question {i + 1}</h3>
              <p className="question-text">{q.question}</p>
              <div className="options-list">
                {q.options.map((opt, j) => {
                  const isCorrect = opt === q.correctAnswer;
                  const letter = String.fromCharCode(65 + j);
                  return (
                    <div key={j} className={isCorrect ? "option correct" : "option"}>
                      <span className="option-letter">{letter}</span>
                      <span className="option-text">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
