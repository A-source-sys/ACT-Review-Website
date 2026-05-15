export type Section = "ENGLISH" | "MATHEMATICS" | "READING" | "SCIENCE";

export interface Question {
  source: string;
  section: Section;
  number: number;
  stem: string;
  choices: Record<string, string>;
  correct_answer: string | null;
  passage_ref?: string | null;
  explanation?: string;
}

export interface SessionStats {
  score: number;
  correct: number;
  wrong: number;
  streak: number;
  bySection: Record<Section, { correct: number; wrong: number }>;
}

export const SECTIONS: Record<Section, { label: string; color: string; total: number }> = {
  ENGLISH:     { label: "English",     color: "#1D9E75", total: 75 },
  MATHEMATICS: { label: "Math",        color: "#185FA5", total: 60 },
  READING:     { label: "Reading",     color: "#BA7517", total: 40 },
  SCIENCE:     { label: "Science",     color: "#993C1D", total: 40 },
};

export const POINTS_PER_CORRECT = 10;
