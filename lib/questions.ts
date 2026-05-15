import fs from "fs";
import path from "path";
import type { Question, Section } from "@/types";

const QUESTIONS_DIR = path.join(process.cwd(), "data", "questions");

let cache: Question[] | null = null;

export function loadAllQuestions(): Question[] {
  if (cache) return cache;

  if (!fs.existsSync(QUESTIONS_DIR)) return [];

  const files = fs
    .readdirSync(QUESTIONS_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"));

  const all: Question[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(QUESTIONS_DIR, file), "utf-8");
      const parsed = JSON.parse(raw);
      // Support both array format and { questions: [] } format
      const questions: Question[] = Array.isArray(parsed)
        ? parsed
        : parsed.questions ?? [];
      all.push(...questions);
    } catch (e) {
      console.warn(`[act-prep] Could not parse ${file}:`, e);
    }
  }

  // Only keep questions with a valid answer and at least 2 choices
  cache = all.filter(
    (q) =>
      q.correct_answer &&
      q.stem?.trim() &&
      Object.keys(q.choices ?? {}).length >= 2
  );

  console.log(`[act-prep] Loaded ${cache.length} questions from ${files.length} file(s)`);
  return cache;
}

export function getQuestionsBySection(
  section: Section,
  limit = 10,
  excludeNumbers: number[] = []
): Question[] {
  const all = loadAllQuestions();
  const pool = all.filter(
    (q) =>
      q.section === section &&
      !excludeNumbers.includes(q.number)
  );

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit);
}

export function getSectionCounts(): Record<string, number> {
  const all = loadAllQuestions();
  const counts: Record<string, number> = {};
  for (const q of all) {
    counts[q.section] = (counts[q.section] ?? 0) + 1;
  }
  return counts;
}

// Bust the cache when files change (dev only)
export function bustCache() {
  cache = null;
}
