"use client";

import { useCallback, useMemo, useState } from "react";
import { PieceDemoBoard } from "@/components/piece-demo-board";
import { PieceLevelPractice } from "@/components/piece-level-practice";
import type { LessonSubtopic } from "@/types/lesson";

type LessonPieceMoveLevelsProps = {
  lessonSlug: string;
  subtopic: LessonSubtopic;
};

const levelDescriptions: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Перетащите фигуру на отмеченную клетку. Цель всегда достижима одним правильным ходом.",
  2: "Доведите фигуру до отмеченной клетки за несколько ходов. Здесь важно почувствовать реальный рисунок движения фигуры.",
  3: "Доведите фигуру до отмеченной клетки за несколько ходов, обходя препятствия. На запрещенные клетки вставать нельзя.",
  4: "Съешьте пешку соперника. Для пешки это всегда взятие по диагонали, а для остальных фигур - обычное взятие по правилам их хода.",
  5: "Съешьте пешку, которая двигается после каждого вашего хода. Запретные клетки сохраняются, поэтому здесь нужно одновременно считать маршрут фигуры и путь пешки.",
};

function PieceBadge({
  glyph,
  name,
}: {
  glyph: string;
  name: string;
}) {
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-stone-200 bg-stone-50 text-5xl shadow-inner">
      <span aria-label={name}>{glyph}</span>
    </div>
  );
}

function HintTooltip({ notes }: { notes: string[] }) {
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Подсказка"
        className="peer inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-base font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
      >
        ?
      </button>
      <div className="pointer-events-none absolute right-0 top-full z-20 mt-3 w-80 translate-y-2 rounded-[1.5rem] border border-stone-200 bg-white p-4 text-sm leading-7 text-stone-600 opacity-0 shadow-[0_24px_60px_rgba(28,25,23,0.12)] transition duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100">
        <p className="font-semibold text-stone-950">Подсказка</p>
        <ul className="mt-3 space-y-2">
          {notes.map((note) => (
            <li key={note}>- {note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LessonPieceMoveLevels({
  lessonSlug,
  subtopic,
}: LessonPieceMoveLevelsProps) {
  const availableLevels = useMemo(
    () => [1, 2, 3, 4, 5],
    [subtopic.practice],
  );
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [restartCounter, setRestartCounter] = useState(0);
  const [newPositionCounter, setNewPositionCounter] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const handleSolvedChange = useCallback((solved: boolean) => {
    setIsSolved(solved);
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] bg-stone-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          1. Описание фигуры
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
          <PieceBadge glyph={subtopic.figureGlyph} name={subtopic.figureName} />
          <div className="space-y-4 text-base leading-7 text-stone-700">
            {subtopic.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {subtopic.piece === "P" ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-stone-700">
                Пешка идет вперед, съедает фигуры только по диагонали, а дойдя до последней горизонтали, может превратиться в любую фигуру, кроме короля.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-stone-50 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            {subtopic.piece === "S"
              ? "Как работают эти правила"
              : `Как ходит ${subtopic.figureName.toLowerCase()}`}
          </p>
          <HintTooltip notes={subtopic.demo.notes} />
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
          <div className="min-w-0">
            <PieceDemoBoard
              demo={subtopic.demo}
              boardId={`${lessonSlug}-${subtopic.slug}-demo`}
            />
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <ul className="space-y-2 text-stone-600">
              {subtopic.movementDescription.map((item) => (
                <li key={item}>- {item}</li>
              ))}
              {subtopic.piece !== "S" ? (
                <li>
                  -{" "}
                  {subtopic.piece === "N"
                    ? "Конь - исключение: он умеет перепрыгивать через другие фигуры. Но, как и любая другая фигура, он не может стоять на одной клетке с другой фигурой. Если конь встает на клетку фигуры соперника, он ее съедает, и эта фигура убирается с доски."
                    : "Эта фигура не может перепрыгивать через другие фигуры - ни свои, ни фигуры соперника. Также две фигуры не могут стоять на одной клетке. Если вы встаете на клетку фигуры соперника, вы ее съедаете, и она убирается с доски."}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-stone-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          3. Задание
        </p>

        {subtopic.practice.type === "piece-target" ? (
          <div className="mt-5 space-y-5 rounded-[1.5rem] border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              {availableLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level as 1 | 2 | 3 | 4 | 5)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedLevel === level
                      ? "bg-stone-900 text-white"
                      : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  Уровень {level}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <p className="text-sm leading-7 text-stone-600">
                {levelDescriptions[selectedLevel]}
              </p>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                <PieceLevelPractice
                  piece={subtopic.practice.piece}
                  boardId={`${lessonSlug}-${subtopic.slug}-practice-${selectedLevel}`}
                  restartToken={restartCounter}
                  newPositionToken={newPositionCounter}
                  level={selectedLevel}
                  onSolvedChange={handleSolvedChange}
                />
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setRestartCounter((value) => value + 1)}
                    disabled={isSolved}
                    className={`inline-flex h-fit rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                      isSolved
                        ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                        : "border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    Попробовать еще раз
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSolved(false);
                      setNewPositionCounter((value) => value + 1);
                    }}
                    className="inline-flex h-fit rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                  >
                    Попробовать новую позицию
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[1.5rem] border border-stone-200 bg-white p-5">
            <p className="text-sm leading-7 text-stone-600">
              {subtopic.practice.description}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
