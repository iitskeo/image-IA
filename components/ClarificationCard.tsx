"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

export interface ClarificationQuestion {
  pregunta: string;
  opciones: string[];
}

interface ClarificationCardProps {
  questions: ClarificationQuestion[];
  loading: boolean;
  onSubmit: (answers: string[]) => void;
  t: Dictionary;
}

export function ClarificationCard({ questions, loading, onSubmit, t }: ClarificationCardProps) {
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));

  const allAnswered = answers.every((a) => a.trim().length > 0);

  function setAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-2 p-4">
      <p className="text-sm font-medium text-foreground/80">{t.clarificationTitle}</p>

      {questions.map((q, i) => (
        <div key={i} className="flex flex-col gap-2">
          <p className="text-sm text-foreground">{q.pregunta}</p>
          <div className="flex flex-wrap gap-2">
            {q.opciones.map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => setAnswer(i, opcion)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  answers[i] === opcion
                    ? "border-transparent bg-[var(--accent-from)] text-[var(--accent-ink)]"
                    : "border-line bg-surface text-foreground/70 hover:bg-background"
                }`}
              >
                {opcion}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={answers[i] && !q.opciones.includes(answers[i]) ? answers[i] : ""}
            onChange={(e) => setAnswer(i, e.target.value)}
            placeholder={t.customAnswerPlaceholder}
            className="rounded-lg border border-line bg-background px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
          />
        </div>
      ))}

      <button
        type="button"
        disabled={!allAnswered || loading}
        onClick={() => onSubmit(answers)}
        className="btn-primary self-start rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed"
      >
        {t.generate}
      </button>
    </div>
  );
}
