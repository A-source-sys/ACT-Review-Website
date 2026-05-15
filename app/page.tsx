"use client";

import { useState, useCallback, useEffect } from "react";
import type { Question, Section } from "@/types";
import { SECTIONS } from "@/types";
import { useScore } from "@/lib/useScore";
import QuestionCard from "@/components/QuestionCard";
import styles from "./page.module.css";

const BATCH_SIZE = 10;

export default function Home() {
  const [section, setSection] = useState<Section>("ENGLISH");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const [seenNumbers, setSeenNumbers] = useState<Record<Section, number[]>>({
    ENGLISH: [], MATHEMATICS: [], READING: [], SCIENCE: [],
  });

  const { stats, accuracy, recordAnswer, resetStats } = useScore();

  // Load question counts on mount
  useEffect(() => {
    fetch("/api/questions?counts=1")
      .then((r) => r.json())
      .then((d) => setDbCounts(d.counts ?? {}))
      .catch(() => {});
  }, []);

  const fetchBatch = useCallback(async (sec: Section, seen: number[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        section: sec,
        limit: String(BATCH_SIZE),
        ...(seen.length ? { exclude: seen.join(",") } : {}),
      });
      const res = await fetch(`/api/questions?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!data.questions?.length) throw new Error("No questions found in database for this section.");
      setQuestions(data.questions);
      setQIndex(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  function switchSection(sec: Section) {
    setSection(sec);
    setQuestions([]);
    setQIndex(0);
    setError(null);
    fetchBatch(sec, seenNumbers[sec]);
  }

  function handleAnswer(correct: boolean) {
    recordAnswer(section, correct);
  }

  function handleNext() {
    const nextIndex = qIndex + 1;
    if (nextIndex < questions.length) {
      setQIndex(nextIndex);
    } else {
      // Track seen questions to avoid repeats
      const justSeen = questions.map((q) => q.number);
      setSeenNumbers((prev) => {
        const updated = [...(prev[section] ?? []), ...justSeen];
        const next = { ...prev, [section]: updated };
        fetchBatch(section, next[section]);
        return next;
      });
    }
  }

  const hasDB = Object.values(dbCounts).some((n) => n > 0);
  const currentQ = questions[qIndex];
  const totalForSection = dbCounts[section] ?? 0;

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          ACT <span className={styles.accent}>Prep</span>
        </div>
        <div className={styles.scorePill}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreNum}>{stats.score.toLocaleString()}</span>
        </div>
      </header>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statVal} style={{ color: "#0F6E56" }}>{stats.correct}</span>
          <span className={styles.statLabel}>Correct</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal} style={{ color: "#dc2626" }}>{stats.wrong}</span>
          <span className={styles.statLabel}>Incorrect</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{accuracy !== null ? `${accuracy}%` : "—"}</span>
          <span className={styles.statLabel}>Accuracy</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal} style={{ color: stats.streak >= 3 ? "#BA7517" : undefined }}>
            {stats.streak}
          </span>
          <span className={styles.statLabel}>{stats.streak >= 3 ? "🔥 Streak" : "Streak"}</span>
        </div>
      </div>

      {/* Section tabs */}
      <div className={styles.tabs}>
        {(Object.entries(SECTIONS) as [Section, typeof SECTIONS[Section]][]).map(([key, meta]) => (
          <button
            key={key}
            className={`${styles.tab} ${section === key ? styles.tabActive : ""}`}
            onClick={() => switchSection(key)}
            style={section === key ? { background: meta.color, borderColor: meta.color } : {}}
          >
            {meta.label}
            {dbCounts[key] != null && (
              <span className={styles.tabCount}>{dbCounts[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* DB warning */}
      {!hasDB && !loading && (
        <div className={styles.notice}>
          <strong>No questions loaded yet.</strong> Drop your <code>act_questions.json</code> into{" "}
          <code>data/questions/</code> then restart the dev server. See the README for the expected format.
        </div>
      )}

      {/* Question area */}
      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading {SECTIONS[section].label} questions…</p>
        </div>
      )}

      {error && !loading && (
        <div className={styles.errorCard}>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.retryBtn} onClick={() => fetchBatch(section, seenNumbers[section])}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && !currentQ && hasDB && (
        <div className={styles.startCard}>
          <p className={styles.startTitle}>Ready to practice {SECTIONS[section].label}?</p>
          <p className={styles.startSub}>
            {totalForSection > 0
              ? `${totalForSection} questions available in your database.`
              : "No questions found for this section yet."}
          </p>
          <button
            className={styles.startBtn}
            onClick={() => fetchBatch(section, seenNumbers[section])}
            disabled={totalForSection === 0}
          >
            Start →
          </button>
        </div>
      )}

      {!loading && !error && currentQ && (
        <QuestionCard
          key={`${section}-${currentQ.source}-${currentQ.number}`}
          question={currentQ}
          qNum={qIndex + 1}
          total={questions.length}
          section={section}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}

      {/* Reset */}
      {(stats.correct + stats.wrong) > 0 && (
        <div className={styles.resetRow}>
          <button className={styles.resetBtn} onClick={resetStats}>Reset score</button>
        </div>
      )}

      {/* By-section breakdown */}
      {(stats.correct + stats.wrong) > 0 && (
        <div className={styles.breakdown}>
          <p className={styles.breakdownTitle}>Section breakdown</p>
          <div className={styles.breakdownGrid}>
            {(Object.entries(SECTIONS) as [Section, typeof SECTIONS[Section]][]).map(([key, meta]) => {
              const s = stats.bySection[key];
              const total = s.correct + s.wrong;
              const pct = total > 0 ? Math.round((s.correct / total) * 100) : null;
              return (
                <div key={key} className={styles.breakdownCard}>
                  <span className={styles.breakdownLabel}>{meta.label}</span>
                  <span className={styles.breakdownPct} style={{ color: meta.color }}>
                    {pct !== null ? `${pct}%` : "—"}
                  </span>
                  <span className={styles.breakdownSub}>{s.correct}/{total} correct</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
