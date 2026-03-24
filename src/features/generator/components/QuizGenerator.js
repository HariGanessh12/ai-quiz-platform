"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const MIN_LOADING_MS = 1500;
const SKELETON_DELAY_MS = 280;
const SKELETON_EXIT_MS = 260;
const TYPE_SPEED_MS = 24;
const OPTION_STAGGER_MS = 130;
const CARD_ENTER_DELAY_MS = 180;
const CARD_HOLD_MS = 380;
const CARD_SCROLL_DELAY_MS = 160;
const CARD_SCROLL_RETRY_MS = 90;
const CARD_SCROLL_MAX_RETRIES = 8;

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [count, setCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  const [typedQuestions, setTypedQuestions] = useState({});
  const [visibleOptions, setVisibleOptions] = useState({});
  const [visibleCards, setVisibleCards] = useState(0);
  const [error, setError] = useState("");
  const [skeletonVisible, setSkeletonVisible] = useState(false);
  const [skeletonLeaving, setSkeletonLeaving] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [revealCycle, setRevealCycle] = useState(0);

  const resultsRef = useRef(null);
  const cardRefs = useRef([]);
  const timersRef = useRef([]);
  const intervalsRef = useRef([]);

  const registerTimeout = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  };

  const registerInterval = (callback, delay) => {
    const interval = window.setInterval(callback, delay);
    intervalsRef.current.push(interval);
    return interval;
  };

  const clearScheduledWork = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    intervalsRef.current.forEach((interval) => window.clearInterval(interval));
    timersRef.current = [];
    intervalsRef.current = [];
  };

  const resetRevealState = () => {
    setDisplayQuestions([]);
    setTypedQuestions({});
    setVisibleOptions({});
    setVisibleCards(0);
    setSkeletonVisible(false);
    setSkeletonLeaving(false);
    setInteractive(false);
    cardRefs.current = [];
  };

  const scrollToY = (targetY) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const safeTarget = Math.max(0, Math.min(targetY, maxScroll));
    const lenis = window.__lenis;

    if (lenis?.scrollTo) {
      lenis.scrollTo(safeTarget, {
        duration: 1,
        immediate: false,
        lock: false,
      });
      return;
    }

    window.scrollTo({
      top: safeTarget,
      behavior: "smooth",
    });
  };

  const getCardScrollTarget = (element) => {
    if (!element) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY - window.innerHeight * 0.24;
  };

  const scrollToCardElement = (element) => {
    const targetY = getCardScrollTarget(element);

    if (targetY === null) {
      return false;
    }

    scrollToY(targetY);
    return true;
  };

  const queueCardScroll = (element, attempt = 0) => {
    if (!element) {
      return;
    }

    const delay = attempt === 0 ? CARD_SCROLL_DELAY_MS : CARD_SCROLL_RETRY_MS;

    registerTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const didScroll = scrollToCardElement(element);

          if (!didScroll && attempt < CARD_SCROLL_MAX_RETRIES) {
            queueCardScroll(element, attempt + 1);
          }
        });
      });
    }, delay);
  };

  const parseGenerateResponse = async (res) => {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return res.json();
    }

    const rawText = await res.text();
    const cleanedText = rawText.trim();

    if (cleanedText.startsWith("<!DOCTYPE") || cleanedText.startsWith("<html")) {
      throw new Error("The /api/generate route returned an HTML 404 page. Restart the Next.js dev server and try again.");
    }

    throw new Error(cleanedText || "The server returned an unexpected response.");
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!topic.trim() || loading) {
      return;
    }

    clearScheduledWork();
    setLoading(true);
    setError("");
    resetRevealState();

    registerTimeout(() => {
      setSkeletonVisible(true);
    }, SKELETON_DELAY_MS);

    const startedAt = performance.now();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count: parseInt(count, 10) }),
      });

      const data = await parseGenerateResponse(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate questions.");
      }

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }

      setDisplayQuestions(data.questions || []);
      setSkeletonLeaving(true);

      registerTimeout(() => {
        setSkeletonVisible(false);
        setSkeletonLeaving(false);
        setRevealCycle((current) => current + 1);
      }, SKELETON_EXIT_MS);
    } catch (err) {
      clearScheduledWork();
      setSkeletonVisible(false);
      setSkeletonLeaving(false);
      setLoading(false);
      setInteractive(false);
      setError(err.message || "Something went wrong while generating questions.");
    }
  };

  useEffect(() => {
    if (!displayQuestions.length || skeletonVisible || skeletonLeaving) {
      return undefined;
    }

    let timelineCursor = 0;

    displayQuestions.forEach((question, questionIndex) => {
      const questionText = question.question || "";
      const cardStart = timelineCursor;
      const typeStart = cardStart + CARD_ENTER_DELAY_MS;
      const typeDuration = Math.max(questionText.length, 1) * TYPE_SPEED_MS;
      const optionsStart = typeStart + typeDuration + 140;
      const finishAt = optionsStart + question.options.length * OPTION_STAGGER_MS + CARD_HOLD_MS;

      registerTimeout(() => {
        setVisibleCards((current) => Math.max(current, questionIndex + 1));
      }, cardStart);

      registerTimeout(() => {
        if (!questionText.length) {
          setTypedQuestions((current) => ({ ...current, [questionIndex]: "" }));
          return;
        }

        let cursor = 0;
        const typingInterval = registerInterval(() => {
          cursor += 1;
          setTypedQuestions((current) => ({
            ...current,
            [questionIndex]: questionText.slice(0, cursor),
          }));

          if (cursor >= questionText.length) {
            window.clearInterval(typingInterval);
            intervalsRef.current = intervalsRef.current.filter((item) => item !== typingInterval);
          }
        }, TYPE_SPEED_MS);
      }, typeStart);

      question.options.forEach((_, optionIndex) => {
        registerTimeout(() => {
          setVisibleOptions((current) => ({
            ...current,
            [questionIndex]: optionIndex + 1,
          }));
        }, optionsStart + optionIndex * OPTION_STAGGER_MS);
      });

      timelineCursor = finishAt;
    });

    registerTimeout(() => {
      setInteractive(true);
      setLoading(false);
    }, timelineCursor);

    return () => {
      gsap.killTweensOf(".question-card");
    };
  }, [displayQuestions, revealCycle, skeletonVisible, skeletonLeaving]);

  useEffect(() => {
    if (!visibleCards) {
      return undefined;
    }

    const latestCard = cardRefs.current[visibleCards - 1];

    if (!latestCard) {
      return undefined;
    }

    queueCardScroll(latestCard);

    gsap.killTweensOf(latestCard);
    gsap.fromTo(
      latestCard,
      {
        opacity: 0,
        y: 28,
        scale: 0.96,
        filter: "blur(8px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.82,
        ease: "power3.out",
      }
    );

    return () => {
      gsap.killTweensOf(latestCard);
    };
  }, [visibleCards]);

  useEffect(() => {
    return () => {
      clearScheduledWork();
    };
  }, []);

  const showResultsShell = skeletonVisible || skeletonLeaving || displayQuestions.length > 0;
  const visibleQuestions = displayQuestions.slice(0, visibleCards);
  const showLoadingOverlay = loading && !interactive;
  const showScrollRunway = showLoadingOverlay && visibleCards < displayQuestions.length;
  const resultsContainerClassName = [
    "results-container",
    skeletonLeaving ? "is-buffered" : "is-live",
    showScrollRunway ? "has-scroll-runway" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {showLoadingOverlay && <div className="generator-loading-overlay" aria-hidden="true" />}

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

        <button
          type="submit"
          className={`generate-btn ${loading ? "loading" : ""}`.trim()}
          disabled={loading || !topic.trim()}
        >
          <span className="generate-btn-label">Generate Questions</span>
          <span className="generate-btn-spinner" aria-hidden="true" />
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {showResultsShell && (
        <div
          className={`results-shell ${loading && !interactive ? "is-locked" : "is-interactive"}`.trim()}
          ref={resultsRef}
        >
          {(skeletonVisible || skeletonLeaving) && (
            <div className={`skeleton-card ${skeletonLeaving ? "is-leaving" : ""}`.trim()}>
              <div className="skeleton-chip shimmer-block" />
              <div className="skeleton-line skeleton-line-question shimmer-block" />
              <div className="skeleton-line skeleton-line-wide shimmer-block" />
              <div className="skeleton-line skeleton-line-mid shimmer-block" />
              <div className="skeleton-options">
                <div className="skeleton-option shimmer-block" />
                <div className="skeleton-option shimmer-block" />
                <div className="skeleton-option shimmer-block" />
                <div className="skeleton-option shimmer-block" />
              </div>
            </div>
          )}

          {visibleQuestions.length > 0 && (
            <div className={resultsContainerClassName}>
              {visibleQuestions.map((q, i) => {
                const typedText = typedQuestions[i] ?? "";
                const isTyping = typedText.length < (q.question || "").length;
                const visibleCount = visibleOptions[i] ?? 0;

                return (
                  <div
                    key={`${revealCycle}-${i}`}
                    className="question-card"
                    ref={(node) => {
                      cardRefs.current[i] = node;
                    }}
                  >
                    <h3>Question {i + 1}</h3>
                    <p className="question-text typewriter-text">
                      <span>{typedText}</span>
                      {isTyping && <span className="typewriter-cursor" aria-hidden="true" />}
                    </p>
                    <div className="options-list">
                      {q.options.map((opt, j) => {
                        const isCorrect = opt === q.correctAnswer;
                        const letter = String.fromCharCode(65 + j);
                        const isVisible = j < visibleCount;

                        return (
                          <div
                            key={j}
                            className={`${isCorrect ? "option correct" : "option"} ${isVisible ? "is-visible" : ""}`.trim()}
                          >
                            <span className="option-letter">{letter}</span>
                            <span className="option-text">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
