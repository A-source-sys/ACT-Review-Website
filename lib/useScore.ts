"use client";
import { useState, useEffect, useCallback } from "react";
import type { SessionStats, Section } from "@/types";
import { POINTS_PER_CORRECT } from "@/types";

const STORAGE_KEY = "act_prep_stats";

const DEFAULT_STATS: SessionStats = {
  score: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  bySection: {
    ENGLISH:     { correct: 0, wrong: 0 },
    MATHEMATICS: { correct: 0, wrong: 0 },
    READING:     { correct: 0, wrong: 0 },
    SCIENCE:     { correct: 0, wrong: 0 },
  },
};

export function useScore() {
  const [stats, setStats] = useState<SessionStats>(DEFAULT_STATS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setStats(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (next: SessionStats) => {
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const recordAnswer = useCallback((section: Section, correct: boolean) => {
    setStats((prev) => {
      const next: SessionStats = {
        score:   correct ? prev.score + POINTS_PER_CORRECT : prev.score,
        correct: correct ? prev.correct + 1 : prev.correct,
        wrong:   correct ? prev.wrong : prev.wrong + 1,
        streak:  correct ? prev.streak + 1 : 0,
        bySection: {
          ...prev.bySection,
          [section]: {
            correct: prev.bySection[section].correct + (correct ? 1 : 0),
            wrong:   prev.bySection[section].wrong   + (correct ? 0 : 1),
          },
        },
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetStats = useCallback(() => save(DEFAULT_STATS), []);

  const accuracy =
    stats.correct + stats.wrong > 0
      ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
      : null;

  return { stats, accuracy, recordAnswer, resetStats };
}
