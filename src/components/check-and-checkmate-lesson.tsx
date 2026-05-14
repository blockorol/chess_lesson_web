"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  isCheckmate,
  isInCheck,
  positionToPlacements,
  type BoardArrow,
  type BoardMove,
  type ChessColor,
  type LessonPieceSymbol,
} from "@/lib/chess";
import { appColors, type FeedbackTone } from "@/lib/colors";
import type { BoardPosition, Piece, Square } from "@/types/chessboard";
import {
  mateInOnePositions,
  mateQuizPositions,
  type MateInOnePosition,
  type MateQuizPosition,
} from "@/data/checkmate-positions";
import { drawExamplePositions, type DrawExamplePosition } from "@/data/draw-example-positions";
import {
  stalemateExamplePositions,
  stalemateQuizPositions,
  type StalemateExamplePosition,
  type StalemateQuizPosition,
} from "@/data/stalemate-positions";

type EscapeMode = "move" | "capture" | "block" | "any";
type PracticeLevel = 1 | 2 | 3;
type MateTaskMode = "mate-quiz" | "mate-in-one";

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

  if (checkingPieces.has(move.to)) {
    return "capture";
  }

  if (kingSquare === move.from) {
    return "move";
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

type MoveCheckResult =
  | {
      type: "valid";
      nextBoard: BoardPosition;
    }
  | {
      type: "wrong-method";
      message: string;
      nextBoard: BoardPosition;
    }
  | {
      type: "illegal";
      message: string;
    };

type PracticeFeedback = {
  type: FeedbackTone;
  message: string;
} | null;

const escapeModeOptions: Array<{
  mode: EscapeMode;
  title: string;
  description: string;
}> = [
  {
    mode: "move",
    title: "Уйти от нападения",
    description: "Ходить должен король. Нужно уйти с атакованной линии так, чтобы шаха больше не было.",
  },
  {
    mode: "capture",
    title: "Уничтожить атакующую фигуру",
    description: "Нужно снять шах именно взятием той фигуры, которая напала на короля.",
  },
  {
    mode: "block",
    title: "Закрыться от нападения",
    description: "Нужно поставить свою фигуру между королем и атакующей фигурой.",
  },
  {
    mode: "any",
    title: "Спастись любым путем",
    description: "Подходит любой законный ход, после которого король больше не находится под шахом.",
  },
];

function getEscapeModeOption(mode: EscapeMode) {
  return escapeModeOptions.find((option) => option.mode === mode) ?? escapeModeOptions[0];
}

function getFeedbackForMove(exercise: CheckExercise, move: BoardMove): MoveCheckResult {
  const piece = exercise.board[move.from];

  if (!piece || !piece.startsWith("w")) {
    return {
      type: "illegal",
      message: "\u0425\u043e\u0434\u0438\u0442\u044c \u043d\u0443\u0436\u043d\u043e \u0431\u0435\u043b\u043e\u0439 \u0444\u0438\u0433\u0443\u0440\u043e\u0439.",
    };
  }

  const legalMoves = getLegalMovesForColor(exercise.board, "white");
  const isLegal = legalMoves.some((legalMove) => legalMove.from === move.from && legalMove.to === move.to);

  if (!isLegal) {
    return {
      type: "illegal",
      message: "\u0424\u0438\u0433\u0443\u0440\u0430 \u0442\u0430\u043a \u043d\u0435 \u0445\u043e\u0434\u0438\u0442.",
    };
  }

  const nextBoard = applyBoardMove(exercise.board, move);
  const kind = getMoveKind(exercise.board, move);

  if (exercise.mode === "move" && kind !== "move") {
    return {
      type: "wrong-method",
      message: "\u041d\u0435\u0432\u0435\u0440\u043d\u043e. \u0428\u0430\u0445 \u0441\u043d\u044f\u0442, \u043d\u043e \u043d\u0435 \u0443\u0445\u043e\u0434\u043e\u043c \u043e\u0442 \u043d\u0430\u043f\u0430\u0434\u0435\u043d\u0438\u044f.",
      nextBoard,
    };
  }

  if (exercise.mode === "capture" && kind !== "capture") {
    return {
      type: "wrong-method",
      message: "\u041d\u0435\u0432\u0435\u0440\u043d\u043e. \u0428\u0430\u0445 \u0441\u043d\u044f\u0442, \u043d\u043e \u043d\u0435 \u0443\u043d\u0438\u0447\u0442\u043e\u0436\u0435\u043d\u0438\u0435\u043c \u0430\u0442\u0430\u043a\u0443\u044e\u0449\u0435\u0439 \u0444\u0438\u0433\u0443\u0440\u044b.",
      nextBoard,
    };
  }

  if (exercise.mode === "block" && kind !== "block") {
    return {
      type: "wrong-method",
      message: "\u041d\u0435\u0432\u0435\u0440\u043d\u043e. \u0428\u0430\u0445 \u0441\u043d\u044f\u0442, \u043d\u043e \u043d\u0435 \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435\u043c.",
      nextBoard,
    };
  }

  return {
    type: "valid",
    nextBoard,
  };
}
function CheckEscapePractice() {
  const [mode, setMode] = useState<EscapeMode>("move");
  const [level, setLevel] = useState<PracticeLevel>(1);
  const [exercise, setExercise] = useState<CheckExercise>(() => createExercise(mode, 1));
  const [displayBoard, setDisplayBoard] = useState<BoardPosition>(() => exercise.board);
  const [feedback, setFeedback] = useState<PracticeFeedback>(null);
  const [answerVisible, setAnswerVisible] = useState(false);
  const transitionTimer = useRef<number | null>(null);

  function clearTransitionTimer() {
    if (transitionTimer.current === null) {
      return;
    }

    window.clearTimeout(transitionTimer.current);
    transitionTimer.current = null;
  }

  useEffect(() => clearTransitionTimer, []);

  function loadNext(nextLevel = level, nextMode = mode) {
    clearTransitionTimer();
    const nextExercise = createExercise(nextMode, nextLevel);
    setExercise(nextExercise);
    setDisplayBoard(nextExercise.board);
    setFeedback(null);
    setAnswerVisible(false);
  }

  const selectedMode = getEscapeModeOption(mode);
  const arrows: BoardArrow[] = answerVisible
    ? [{ from: exercise.answer.from, to: exercise.answer.to, color: appColors.arrow.success }]
    : [];

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Задание</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{selectedMode.title}</h3>
        <p className="mt-3 text-sm leading-7 text-stone-600">{selectedMode.description}</p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {escapeModeOptions.map((item) => (
          <button
            key={item.mode}
            type="button"
            className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              mode === item.mode
                ? "bg-stone-900 text-white"
                : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
            }`}
            onClick={() => {
              setMode(item.mode);
              loadNext(level, item.mode);
            }}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
            {"\u0423\u0440\u043e\u0432\u0435\u043d\u044c"} {item}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm leading-7 text-stone-600">{exercise.message}</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <ChessBoard
          boardId={`check-escape-${mode}-${level}`}
          pieces={positionToPlacements(displayBoard)}
          arrows={arrows}
          overlay={feedback}
          draggable
          onPieceDrop={(from, to) => {
            const result = getFeedbackForMove(exercise, { from, to });

            if (result.type === "illegal") {
              clearTransitionTimer();
              setFeedback({ type: "info", message: result.message });
              return false;
            }

            clearTransitionTimer();
            setDisplayBoard(result.nextBoard);

            if (result.type === "wrong-method") {
              setFeedback({ type: "error", message: result.message });
              transitionTimer.current = window.setTimeout(() => {
                setDisplayBoard(exercise.board);
                transitionTimer.current = null;
              }, 2000);
              return true;
            }

            setFeedback({ type: "success", message: "\u0412\u0435\u0440\u043d\u043e. \u0428\u0430\u0445 \u0441\u043d\u044f\u0442." });
            transitionTimer.current = window.setTimeout(() => {
              loadNext();
              transitionTimer.current = null;
            }, 2000);
            return true;
          }}
        />
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => loadNext()}
            className="inline-flex justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            {"\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c"}
          </button>
          <button
            type="button"
            onClick={() => setAnswerVisible(true)}
            className="inline-flex justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043e\u0442\u0432\u0435\u0442"}
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
  adminHref,
}: {
  title: string;
  description: string;
  count: number;
  adminHref?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-4 text-sm leading-7 text-stone-600 sm:p-5">
      <p className="font-semibold text-stone-950">{title}</p>
      <p className="mt-2">{description}</p>
      <p className="mt-2 text-stone-500">Сейчас в наборе позиций: {count}.</p>
      {adminHref ? (
        <Link
          href={adminHref}
          className="mt-3 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Открыть админку
        </Link>
      ) : null}
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
      arrows={[{ from: "e8", to: "e1", color: appColors.arrow.danger }]}
    />
  );
}

function getSideToMoveLabel(sideToMove: "white" | "black") {
  return sideToMove === "white" ? "белые" : "черные";
}

function getSideToMoveInstrumentalLabel(sideToMove: "white" | "black") {
  return sideToMove === "white" ? "белыми" : "черными";
}

function getOpponentColor(color: ChessColor): ChessColor {
  return color === "white" ? "black" : "white";
}

function MateQuizCarousel({ adminHref, positions }: { adminHref?: string; positions: MateQuizPosition[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const activePosition = positions[activeIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered ? selectedAnswer === activePosition?.isMate : false;

  function goToPosition(nextIndex: number) {
    setActiveIndex(nextIndex);
    setSelectedAnswer(null);
  }

  if (!activePosition) {
    return (
      <DatasetPlaceholder
        title="Определите, мат ли это"
        description="Здесь будет набор из 30 позиций в src/data/mate-quiz-positions.ts."
        count={positions.length}
        adminHref={adminHref}
      />
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start">
        <div>
          <p className="mb-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Позиция {activeIndex + 1} из {positions.length}
          </p>
          <ChessBoard
            boardId={`mate-quiz-${activePosition.id}`}
            pieces={positionToPlacements(activePosition.position)}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-stone-950">Определите, мат ли это</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedAnswer === true
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
              }`}
              onClick={() => setSelectedAnswer(true)}
            >
              Это мат
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedAnswer === false
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
              }`}
              onClick={() => setSelectedAnswer(false)}
            >
              Это не мат
            </button>
          </div>
          {isAnswered ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
                isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
              }`}
            >
              <p className="font-semibold">
                {isCorrect ? "Правильно." : "Неверно."} Ответ: {activePosition.isMate ? "это мат" : "это не мат"}.
              </p>
              {activePosition.explanation ? <p className="mt-2">{activePosition.explanation}</p> : null}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              onClick={() => goToPosition(activeIndex === 0 ? positions.length - 1 : activeIndex - 1)}
            >
              Назад
            </button>
            <button
              type="button"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
              onClick={() => goToPosition((activeIndex + 1) % positions.length)}
            >
              Следующая позиция
            </button>
            {adminHref ? (
              <Link
                href={adminHref}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Открыть админку
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MateInOnePractice({ adminHref, positions }: { adminHref?: string; positions: MateInOnePosition[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePosition = positions[activeIndex];
  const [displayBoard, setDisplayBoard] = useState<BoardPosition>(() => activePosition?.position ?? {});
  const [result, setResult] = useState<PracticeFeedback>(null);
  const [answerVisible, setAnswerVisible] = useState(false);
  const isSolved = result?.type === "success";
  const isFailed = result?.type === "error";

  function resetTask(position = activePosition) {
    setDisplayBoard(position?.position ?? {});
    setResult(null);
    setAnswerVisible(false);
  }

  function goToTask(nextIndex: number) {
    const nextPosition = positions[nextIndex];

    setActiveIndex(nextIndex);
    resetTask(nextPosition);
  }

  if (!activePosition) {
    return (
      <DatasetPlaceholder
        title="Поставьте мат в 1 ход"
        description="Здесь будет набор из 30 позиций с примером правильного хода в src/data/mate-in-one-positions.ts. При проверке важно только то, стал ли ход матом."
        count={positions.length}
        adminHref={adminHref}
      />
    );
  }

  const answerArrows: BoardArrow[] = answerVisible
    ? [
        {
          from: activePosition.exampleAnswer.from as Square,
          to: activePosition.exampleAnswer.to as Square,
          color: appColors.arrow.success,
        },
      ]
    : [];

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start">
        <div>
          <p className="mb-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Задача {activeIndex + 1} из {positions.length}
          </p>
          <ChessBoard
            boardId={`mate-in-one-${activePosition.id}`}
            pieces={positionToPlacements(displayBoard)}
            arrows={answerArrows}
            overlay={result}
          draggable={!isSolved && !isFailed}
          onPieceDrop={(from, to) => {
            const movedPiece = activePosition.position[from];

            if (!movedPiece || !movedPiece.startsWith(activePosition.sideToMove === "white" ? "w" : "b")) {
              setResult({
                type: "info",
                message: `Мат должны поставить ${getSideToMoveInstrumentalLabel(activePosition.sideToMove)}.`,
              });
              return false;
            }

            const legalMoves = getLegalMovesForColor(activePosition.position, activePosition.sideToMove);
            const isLegal = legalMoves.some((move) => move.from === from && move.to === to);

              if (!isLegal) {
                setResult({ type: "info", message: "Фигура так не ходит." });
                return false;
              }

              const nextBoard = applyBoardMove(activePosition.position, { from, to });
              setDisplayBoard(nextBoard);

              if (isCheckmate(nextBoard, getOpponentColor(activePosition.sideToMove))) {
                setResult({ type: "success", message: "Верно. Это мат." });
              } else {
                setResult({ type: "error", message: "Не мат." });
              }

              return true;
            }}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-stone-950">Поставьте мат в 1 ход</h3>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Ход: {getSideToMoveLabel(activePosition.sideToMove)}. Сделайте один ход на доске.
          </p>
          {result ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
                result.type === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : result.type === "error"
                    ? "bg-rose-50 text-rose-800"
                    : "bg-stone-100 text-stone-700"
              }`}
            >
              <p className="font-semibold">{result.message}</p>
              {activePosition.explanation ? <p className="mt-2">{activePosition.explanation}</p> : null}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {isFailed ? (
              <button
                type="button"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                onClick={() => resetTask()}
              >
                Попробовать еще раз
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              onClick={() => goToTask((activeIndex + 1) % positions.length)}
            >
              {isSolved ? "Следующая задача" : "Пропустить"}
            </button>
            <button
              type="button"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
              onClick={() => setAnswerVisible(true)}
            >
              Показать ответ
            </button>
            {adminHref ? (
              <Link
                href={adminHref}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Открыть админку
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MateTasksPractice({ showAdminLinks }: { showAdminLinks: boolean }) {
  const [mode, setMode] = useState<MateTaskMode>("mate-quiz");
  const options: Array<{ mode: MateTaskMode; title: string }> = [
    { mode: "mate-quiz", title: "Определите, мат ли это" },
    { mode: "mate-in-one", title: "Поставьте мат в 1 ход" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.mode}
            type="button"
            className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              mode === option.mode
                ? "bg-stone-900 text-white"
                : "border border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
            }`}
            onClick={() => setMode(option.mode)}
          >
            {option.title}
          </button>
        ))}
      </div>

      {mode === "mate-quiz" ? (
        <MateQuizCarousel
          positions={mateQuizPositions}
          adminHref={showAdminLinks ? "/admin?dataset=mateQuiz" : undefined}
        />
      ) : (
        <MateInOnePractice
          positions={mateInOnePositions}
          adminHref={showAdminLinks ? "/admin?dataset=mateInOne" : undefined}
        />
      )}
    </div>
  );
}

function StalemateQuizCarousel({
  adminHref,
  positions,
}: {
  adminHref?: string;
  positions: StalemateQuizPosition[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const activePosition = positions[activeIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered ? selectedAnswer === activePosition?.isStalemate : false;

  function goToPosition(nextIndex: number) {
    setActiveIndex(nextIndex);
    setSelectedAnswer(null);
  }

  if (!activePosition) {
    return (
      <DatasetPlaceholder
        title="Определите, пат или не пат"
        description="Здесь будет набор тестовых позиций в src/data/stalemate-quiz-positions.ts."
        count={positions.length}
        adminHref={adminHref}
      />
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center">
        <div>
          <p className="mb-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Позиция {activeIndex + 1} из {positions.length}
          </p>
          <ChessBoard
            boardId={`stalemate-quiz-${activePosition.id}`}
            pieces={positionToPlacements(activePosition.position)}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-stone-950">Определите, пат или не пат</h3>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Ход: {getSideToMoveLabel(activePosition.sideToMove)}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedAnswer === true
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
              }`}
              onClick={() => setSelectedAnswer(true)}
            >
              Это пат
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedAnswer === false
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
              }`}
              onClick={() => setSelectedAnswer(false)}
            >
              Это не пат
            </button>
          </div>
          {isAnswered ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
                isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
              }`}
            >
              <p className="font-semibold">
                {isCorrect ? "Правильно." : "Неверно."} Ответ:{" "}
                {activePosition.isStalemate ? "это пат" : "это не пат"}.
              </p>
              {activePosition.explanation ? <p className="mt-2">{activePosition.explanation}</p> : null}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              onClick={() => goToPosition(activeIndex === 0 ? positions.length - 1 : activeIndex - 1)}
            >
              Назад
            </button>
            <button
              type="button"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
              onClick={() => goToPosition((activeIndex + 1) % positions.length)}
            >
              Следующая позиция
            </button>
            {adminHref ? (
              <Link
                href={adminHref}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Открыть админку
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StalemateExampleCarousel({
  adminHref,
  positions,
}: {
  adminHref?: string;
  positions: StalemateExamplePosition[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePosition = positions[activeIndex];

  if (!activePosition) {
    return (
      <DatasetPlaceholder
        title="Примеры с патом"
        description="Здесь будет карусель или кнопка 'посмотреть еще' для 30 примеров из src/data/stalemate-example-positions.ts."
        count={positions.length}
        adminHref={adminHref}
      />
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center">
        <div>
          <p className="mb-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Пример {activeIndex + 1} из {positions.length}
          </p>
          <ChessBoard
            boardId={`stalemate-example-${activePosition.id}`}
            pieces={positionToPlacements(activePosition.position)}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-stone-950">Примеры с патом</h3>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Ход: {getSideToMoveLabel(activePosition.sideToMove)}.
          </p>
          <p className="mt-3 text-base leading-7 text-stone-700">
            {activePosition.explanation || "Пояснение не заполнено."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              onClick={() => setActiveIndex((current) => (current === 0 ? positions.length - 1 : current - 1))}
            >
              Назад
            </button>
            <button
              type="button"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
              onClick={() => setActiveIndex((current) => (current + 1) % positions.length)}
            >
              Следующий пример
            </button>
            {adminHref ? (
              <Link
                href={adminHref}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Открыть админку
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function PositionCarousel({ adminHref, positions }: { adminHref?: string; positions: DrawExamplePosition[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePosition = positions[activeIndex];
  const caption = activePosition ? activePosition.caption || "Комментарий не заполнен." : "";

  if (!activePosition) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center">
        <ChessBoard
          boardId={`draw-example-${activePosition.id}`}
          pieces={positionToPlacements(activePosition.position)}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Пример {activeIndex + 1} из {positions.length}
          </p>
          <p className="mt-3 text-base leading-7 text-stone-700">{caption}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-white"
              onClick={() => setActiveIndex((current) => (current === 0 ? positions.length - 1 : current - 1))}
            >
              Назад
            </button>
            <button
              type="button"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
              onClick={() => setActiveIndex((current) => (current + 1) % positions.length)}
            >
              Следующий пример
            </button>
            {adminHref ? (
              <Link
                href={adminHref}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-white"
              >
                Открыть админку
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckAndCheckmateLesson({ showAdminLinks = false }: { showAdminLinks?: boolean }) {
  return (
    <div className="mt-8 space-y-8 sm:mt-10">
      <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Мат</h2>
        <div className="mt-5 space-y-5 text-base leading-7 text-stone-700">
          <p>
            Цель игры - поставить мат сопернику. Часто можно услышать, что цель игры - съесть
            короля, но это не так: в шахматах нельзя съесть короля, можно только напасть на него.
          </p>
          <p>Нападение на короля называется шахом.</p>
          <div className="w-full max-w-[320px]">
            <StaticRuleBoard />
          </div>
          <p>
            Если король под шахом, можно уйти от нападения, защититься другой фигурой или уничтожить
            атакующую фигуру.
          </p>
          <p>Давайте потренируем это:</p>
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <CheckEscapePractice />
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Мат</h2>
        <p className="text-base leading-7 text-stone-700">
          Если ничего из этого невозможно сделать, значит на доске мат. Матом считается позиция,
          где король под нападением и не может спастись ни одним законным ходом.
          А теперь немного практики на распознавание мата и постановку мата в 1 ход:
        </p>
        <MateTasksPractice showAdminLinks={showAdminLinks} />
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Пат</h2>
        <p className="text-base leading-7 text-stone-700">
          Пат - это позиция, где игрок не находится под шахом, но не имеет ни одного законного
          хода. В отличие от мата, это не победа, а ничья.
        </p>
        <StalemateExampleCarousel
          positions={stalemateExamplePositions}
          adminHref={showAdminLinks ? "/admin?dataset=stalemateExamples" : undefined}
        />
        <p className="text-base leading-7 text-stone-700">
          А теперь давайте проверим знания на практике. Ниже несколько задач, где нужно определить,
          пат ли это.
        </p>
        <StalemateQuizCarousel
          positions={stalemateQuizPositions}
          adminHref={showAdminLinks ? "/admin?dataset=stalemateQuiz" : undefined}
        />
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Ничья</h2>
        <p className="text-base leading-7 text-stone-700">
          Другой вариант ничьей - когда ни одна сторона теоретически не может выиграть: например,
          остались только два короля или два короля и один слон.
        </p>
        {drawExamplePositions.length > 0 ? (
          <PositionCarousel
            positions={drawExamplePositions}
            adminHref={showAdminLinks ? "/admin?dataset=drawExamples" : undefined}
          />
        ) : (
          <DatasetPlaceholder
            title="Примеры ничьей"
            description="Здесь будет карусель примеров ничьей с подписями из src/data/draw-example-positions.ts."
            count={drawExamplePositions.length}
            adminHref={showAdminLinks ? "/admin?dataset=drawExamples" : undefined}
          />
        )}
        <p className="text-base leading-7 text-stone-700">
          Также ничья может возникать из-за вечного шаха, трехкратного повторения позиции или
          ситуации, где один игрок не умеет реализовать выигрыш за отведенное число ходов.
        </p>
      </section>
    </div>
  );
}
