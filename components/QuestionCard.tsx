"use client";
import { useState } from "react";
import type { Question, Section } from "@/types";
import styles from "./QuestionCard.module.css";

interface Props {
  question: Question;
  qNum: number;
  total: number;
  section: Section;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}

export default function QuestionCard({ question, qNum, total, section, onAnswer, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const correct = question.correct_answer;

  function handleSelect(letter: string) {
    if (answered) return;
    setSelected(letter);
    onAnswer(letter === correct);
  }

  const progress = Math.round(((qNum - 1) / total) * 100);

  return (
    <div className={styles.card}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.cardHeader}>
        <span className={styles.tag}>{section.charAt(0) + section.slice(1).toLowerCase()}</span>
        <span className={styles.qNum}>Q{qNum} of {total}</span>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.stem}>{question.stem}</p>

        <div className={styles.choices}>
          {Object.entries(question.choices).map(([letter, text]) => {
            let variant = "";
            if (answered) {
              if (letter === selected && letter === correct) variant = styles.correct;
              else if (letter === selected && letter !== correct) variant = styles.wrong;
              else if (letter === correct) variant = styles.showCorrect;
              else variant = styles.dimmed;
            }
            return (
              <button
                key={letter}
                className={`${styles.choice} ${variant}`}
                onClick={() => handleSelect(letter)}
                disabled={answered}
              >
                <span className={styles.letter}>{letter}</span>
                <span className={styles.choiceText}>{text}</span>
              </button>
            );
          })}
        </div>

        {answered && question.explanation && (
          <div className={`${styles.explanation} ${selected === correct ? styles.expCorrect : styles.expWrong}`}>
            <strong>{selected === correct ? "Correct." : `Incorrect — the answer is ${correct}.`}</strong>{" "}
            {question.explanation}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <div>
          {answered && (
            <span className={`${styles.badge} ${selected === correct ? styles.badgeCorrect : styles.badgeWrong}`}>
              {selected === correct ? `+10 pts` : "Incorrect"}
            </span>
          )}
        </div>
        {answered && (
          <button className={styles.nextBtn} onClick={onNext}>
            {qNum < total ? "Next question →" : "Load more →"}
          </button>
        )}
      </div>
    </div>
  );
}
