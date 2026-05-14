"use client";

import { useMemo, useState } from "react";
import { ChessBoard } from "@/components/chess-board";
import {
  applyBoardMove,
  findKingSquare,
  getAllSquares,
  getAttackOrigins,
  getBlockingSquaresBetween,
  getCheckEscapeMoves,
  getCheckingPieces,
  getLegalMovesForColor,
  getMoveOrigins,
  isInCheck,
  positionToPlacements,
  type BoardArrow,
  type BoardMove,
  type ChessColor,
  type LessonPieceSymbol,
} from "@/lib/chess";
import type { BoardPosition, Piece, Square } from "@/types/chessboard";
import { mateInOnePositions, mateQuizPositions } from "@/data/checkmate-positions";
import { stalemateExamplePositions, stalemateQuizPositions } from "@/data/stalemate-positions";

type EscapeMode = "move" | "capture" | "block" | "any";
type PracticeLevel = 1 | 2 | 3;

type CheckExercise = {
  board: BoardPosition;
  mode: EscapeMode;
  level: PracticeLevel;
  answer: BoardMove;
  answerKind: Exclude<EscapeMode, "any">;
  message: string;
};

const blackAttackPieces: LessonPieceSymbol[] = ["Q", "R", "B", "N"];
const slidingAttackPieces: LessonPieceSymbol[] = ["Q", "R", "B"];
const helperPieces: LessonPieceSymbol[] = ["Q", "R", "B", "N"];
const whitePieceMap: Record<LessonPieceSymbol, Piece> = {
  K: "wK",
  Q: "wQ",
  R: "wR",
  B: "wB",
  N: "wN",
  P: "wP",
};
const blackPieceMap: Record<LessonPieceSymbol, Piece> = {
  K: "bK",
  Q: "bQ",
  R: "bR",
  B: "bB",
  N: "bN",
  P: "bP",
};

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function emptySquares(board: BoardPosition): Square[] {
  return getAllSquares().filter((square) => !board[square]);
}

function getMoveKind(before: BoardPosition, move: BoardMove): Exclude<EscapeMode, "any"> {
  const kingSquare = findKingSquare(before, "white");
  const checkingPieces = new Set(getCheckingPieces(before, "white"));

  if (kingSquare === move.from) {
    return "move";
  }

  if (checkingPieces.has(move.to)) {
    return "capture";
  }

  return "block";
}

function classifyLegalAnswers(board: BoardPosition): {
  block: BoardMove[];
  capture: BoardMove[];
  move: BoardMove[];
} {
  const escapes = getCheckEscapeMoves(board, "white");

  return {
    block: escapes.block,
    capture: escapes.capture,
    move: escapes.moveKing,
  };
}

function createCheckingBase(slidingOnly = false): {
  attackerSquare: Square;
  board: BoardPosition;
  kingSquare: Square;
} | null {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const kingSquare = randomItem(getAllSquares());
    const piece = randomItem(slidingOnly ? slidingAttackPieces : blackAttackPieces);
    const attackerOrigins = shuffle(getAttackOrigins(kingSquare, piece, "black")).filter(
      (square) => square !== kingSquare,
    );

    for (const attackerSquare of attackerOrigins) {
      const board: BoardPosition = {
        [kingSquare]: "wK",
        [attackerSquare]: blackPieceMap[piece],
      };

      if (isInCheck(board, "white")) {
        return {
          attackerSquare,
          board,
          kingSquare,
        };
      }
    }
  }

  return null;
}

function addNoisePieces(board: BoardPosition, count: number, color: ChessColor) {
  const nextBoard = { ...board };
  const pieces = color === "white" ? helperPieces : blackAttackPieces;

  for (let index = 0; index < count; index += 1) {
    const squares = emptySquares(nextBoard);

    if (squares.length === 0) {
      break;
    }

    const square = randomItem(squares);
    const piece = randomItem(pieces);
    nextBoard[square] = color === "white" ? whitePieceMap[piece] : blackPieceMap[piece];
  }

  return nextBoard;
}

function createMoveExercise(level: PracticeLevel): CheckExercise {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const base = createCheckingBase(false);

    if (!base) {
      break;
    }

    const board = level === 1 ? base.board : addNoisePieces(base.board, level - 1, "black");
    const answers = classifyLegalAnswers(board).move.filter((move) => !board[move.to]);

    if (answers.length > 0) {
      return {
        board,
        mode: "move",
        level,
        answer: randomItem(answers),
        answerKind: "move",
        message: "Уведите короля из-под шаха. В этой задаче нельзя съедать атакующую фигуру или закрываться.",
      };
    }
  }

  return createMoveExercise(1);
}

function createCaptureExercise(level: PracticeLevel): CheckExercise {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const base = createCheckingBase(false);

    if (!base) {
      break;
    }

    const board = { ...base.board };
    const whitePiece = randomItem(helperPieces);
    const origins = shuffle(getAttackOrigins(base.attackerSquare, whitePiece, "white")).filter(
      (square) => !board[square] && square !== base.kingSquare,
    );

    for (const origin of origins) {
      const nextBoard = {
        ...board,
        [origin]: whitePieceMap[whitePiece],
      };
      const move = {
        from: origin,
        to: base.attackerSquare,
      };

      if (!isInCheck(applyBoardMove(nextBoard, move), "white")) {
        const withNoise = level === 1 ? nextBoard : addNoisePieces(nextBoard, Math.min(8, level * 2), "white");
        return {
          board: withNoise,
          mode: "capture",
          level,
          answer: move,
          answerKind: "capture",
          message: "Съешьте фигуру, которая поставила шах. Уходить королём или закрываться в этой задаче нельзя.",
        };
      }
    }
  }

  return createMoveExercise(1);
}

function createBlockExercise(level: PracticeLevel): CheckExercise {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const base = createCheckingBase(true);

    if (!base) {
      break;
    }

    const blockingSquares = getBlockingSquaresBetween(base.board, base.attackerSquare, base.kingSquare);

    if (blockingSquares.length === 0) {
      continue;
    }

    for (const blockSquare of shuffle(blockingSquares)) {
      const whitePiece = randomItem(helperPieces);
      const origins = shuffle(getMoveOrigins(blockSquare, whitePiece, "white", base.board)).filter(
        (square) => !base.board[square],
      );

      for (const origin of origins) {
        const board = {
          ...base.board,
          [origin]: whitePieceMap[whitePiece],
        };
        const move = {
          from: origin,
          to: blockSquare,
        };

        if (!isInCheck(applyBoardMove(board, move), "white")) {
          const withNoise =
            level === 1
              ? board
              : addNoisePieces(addNoisePieces(board, level - 1, "black"), level, "white");
          return {
            board: withNoise,
            mode: "block",
            level,
            answer: move,
            answerKind: "block",
            message: "Закройтесь от шаха другой фигурой. В этой задаче нельзя уходить королём или съедать атакующую фигуру.",
          };
        }
      }
    }
  }

  return createCaptureExercise(1);
}

function createAnyExercise(level: PracticeLevel): CheckExercise {
  const maker = randomItem([createMoveExercise, createCaptureExercise, createBlockExercise]);
  const exercise = maker(level);

  return {
    ...exercise,
    mode: "any",
    message: "Спаситесь от шаха любым правильным способом.",
  };
}

function createExercise(mode: EscapeMode, level: PracticeLevel): CheckExercise {
  switch (mode) {
    case "move":
      return createMoveExercise(level);
    case "capture":
      return createCaptureExercise(level);
    case "block":
      return createBlockExercise(level);
    case "any":
      return createAnyExercise(level);
  }
}

function getFeedbackForMove(exercise: CheckExercise, move: BoardMove): string | null {
  const piece = exercise.board[move.from];

  if (!piece || !piece.startsWith("w")) {
    return "Ходить нужно белой фигурой.";
  }

  const legalMoves = getLegalMovesForColor(exercise.board, "white");
  const isLegal = legalMoves.some((legalMove) => legalMove.from === move.from && legalMove.to === move.to);

  if (!isLegal) {
    const nextBoard = applyBoardMove(exercise.board, move);
    return isInCheck(nextBoard, "white") ? "Неверно: шах всё еще остается." : "Неверно.";
  }

  const kind = getMoveKind(exercise.board, move);

  if (exercise.mode === "move" && kind !== "move") {
    return kind === "capture" ? "Задача именно уйти, а не съесть фигуру." : "Задача именно уйти королём.";
  }

  if (exercise.mode === "capture" && kind !== "capture") {
    return kind === "move" ? "Неверно: нужно именно уничтожить атакующую фигуру." : "Неверно: нужно именно съесть фигуру, которая поставила шах.";
  }

  if (exercise.mode === "block" && kind !== "block") {
    return kind === "move" ? "Неверно: нужно именно закрыться." : "Неверно: здесь нужно закрыться, а не съесть фигуру.";
  }

  return null;
}

function CheckEscapePractice({ mode }: { mode: EscapeMode }) {
  const [level, setLevel] = useState<PracticeLevel>(1);
  const [exercise, setExercise] = useState<CheckExercise>(() => createExercise(mode, 1));
  const [feedback, setFeedback] = useState("Сделайте ход на доске.");
  const [answerVisible, setAnswerVisible] = useState(false);

  function loadNext(nextLevel = level) {
    setExercise(createExercise(mode, nextLevel));
    setFeedback("Сделайте ход на доске.");
    setAnswerVisible(false);
  }

  const arrows: BoardArrow[] = answerVisible
    ? [{ from: exercise.answer.from, to: exercise.answer.to, color: "rgba(5, 150, 105, 0.9)" }]
    : [];

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              level === item
                ? "bg-stone-900 text-white"
                : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
            }`}
            onClick={() => {
              const nextLevel = item as PracticeLevel;
              setLevel(nextLevel);
              loadNext(nextLevel);
            }}
          >
            Уровень {item}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm leading-7 text-stone-600">{exercise.message}</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <ChessBoard
          boardId={`check-escape-${mode}-${level}`}
          pieces={positionToPlacements(exercise.board)}
          arrows={arrows}
          draggable
          onPieceDrop={(from, to) => {
            const error = getFeedbackForMove(exercise, { from, to });

            if (error) {
              setFeedback(error);
              return false;
            }

            setFeedback("Верно. Шах снят.");
            window.setTimeout(() => loadNext(), 700);
            return true;
          }}
        />
        <div className="flex flex-col gap-3">
          <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700">
            {feedback}
          </p>
          <button
            type="button"
            onClick={() => loadNext()}
            className="inline-flex justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Пропустить
          </button>
          <button
            type="button"
            onClick={() => setAnswerVisible(true)}
            className="inline-flex justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Показать ответ
          </button>
        </div>
      </div>
    </div>
  );
}

function DatasetPlaceholder({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-4 text-sm leading-7 text-stone-600 sm:p-5">
      <p className="font-semibold text-stone-950">{title}</p>
      <p className="mt-2">{description}</p>
      <p className="mt-2 text-stone-500">Сейчас в наборе позиций: {count}.</p>
    </div>
  );
}

function StaticRuleBoard() {
  const board = useMemo<BoardPosition>(
    () => ({
      e1: "wK",
      e8: "bR",
    }),
    [],
  );

  return (
    <ChessBoard
      boardId="check-example-board"
      pieces={positionToPlacements(board)}
      arrows={[{ from: "e8", to: "e1", color: "rgba(220, 38, 38, 0.85)" }]}
    />
  );
}

export function CheckAndCheckmateLesson() {
  return (
    <div className="mt-8 space-y-8 sm:mt-10">
      <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Мат</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-4 text-base leading-7 text-stone-700">
            <p>
              Цель игры - поставить мат сопернику. Часто можно услышать, что цель игры - съесть
              короля, но это не так: в шахматах нельзя съесть короля, можно только напасть на него.
            </p>
            <p>
              Нападение на короля называется шахом. Если король под шахом, можно уйти от нападения,
              защититься другой фигурой или уничтожить атакующую фигуру.
            </p>
          </div>
          <div className="w-full max-w-[320px] justify-self-center lg:justify-self-end">
            <StaticRuleBoard />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Задание
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Уйти от нападения
          </h3>
        </div>
        <CheckEscapePractice mode="move" />
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Задание
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Уничтожить атакующую фигуру
          </h3>
        </div>
        <CheckEscapePractice mode="capture" />
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Задание
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Закрыться от нападения
          </h3>
        </div>
        <CheckEscapePractice mode="block" />
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Общее задание
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Спастись от шаха
          </h3>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Здесь подходит любой способ, если после вашего хода шаха больше нет.
          </p>
        </div>
        <CheckEscapePractice mode="any" />
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Мат</h2>
        <p className="text-base leading-7 text-stone-700">
          Если ничего из этого невозможно сделать, значит на доске мат. Матом считается позиция,
          где король под нападением и не может спастись ни одним законным ходом.
        </p>
        <DatasetPlaceholder
          title="Определите, мат ли это"
          description="Здесь будет набор из 30 позиций в src/data/checkmate-positions.ts."
          count={mateQuizPositions.length}
        />
        <DatasetPlaceholder
          title="Поставьте мат в 1 ход"
          description="Здесь будет набор из 30 позиций с ответами в src/data/checkmate-positions.ts."
          count={mateInOnePositions.length}
        />
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Пат</h2>
        <p className="text-base leading-7 text-stone-700">
          Пат - это позиция, где игрок не находится под шахом, но не имеет ни одного законного
          хода. В отличие от мата, это не победа, а ничья.
        </p>
        <DatasetPlaceholder
          title="Примеры с патом"
          description="Здесь будет карусель или кнопка 'посмотреть еще' для 30 примеров."
          count={stalemateExamplePositions.length}
        />
        <DatasetPlaceholder
          title="Определите, пат или не пат"
          description="Здесь будет набор тестовых позиций в src/data/stalemate-positions.ts."
          count={stalemateQuizPositions.length}
        />
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Ничья</h2>
        <p className="text-base leading-7 text-stone-700">
          Другой вариант ничьей - когда ни одна сторона теоретически не может выиграть: например,
          остались только два короля или два короля и один слон.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Также ничья может возникать из-за вечного шаха, трехкратного повторения позиции или
          ситуации, где один игрок не умеет реализовать выигрыш за отведенное число ходов.
        </p>
      </section>
    </div>
  );
}
