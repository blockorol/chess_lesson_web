"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess-board";
import {
  findShortestPath,
  getInvalidPracticeMoveReason,
  getPiecePlacement,
  getPracticeReachableSquares,
  getRandomReachableTarget,
  getRandomSquare,
  getRandomSquares,
  type LessonPieceSymbol,
  type PracticeMode,
  type SquareStyleMap,
} from "@/lib/chess";
import type { Square } from "@/types/chessboard";

type PracticeLevel = 1 | 2 | 3 | 4 | 5;

type PieceLevelPracticeProps = {
  piece: LessonPieceSymbol;
  boardId: string;
  restartToken?: number;
  newPositionToken?: number;
  level: PracticeLevel;
  onSolvedChange?: (solved: boolean) => void;
};

type ExerciseState = {
  currentSquare: Square;
  targetSquare: Square;
  forbiddenSquares: Square[];
  enemyPawnSquare: Square | null;
  enemyPawnPath: Square[];
  enemyPawnStep: number;
  solved: boolean;
  failed: boolean;
};

type PracticeOverlay = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const pawnStartRanks = ["2", "3", "4", "5", "6"];
const pieceErrorNames: Record<LessonPieceSymbol, string> = {
  K: "король",
  Q: "ферзь",
  R: "ладья",
  B: "слон",
  N: "конь",
  P: "пешка",
};

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function isValidPawnSquare(square: Square): boolean {
  return !square.endsWith("1") && !square.endsWith("8");
}

function getForwardSquare(square: Square, steps = 1): Square | null {
  const file = square[0];
  const rank = Number(square[1]);
  const nextRank = rank + steps;

  if (nextRank < 1 || nextRank > 8) {
    return null;
  }

  return `${file}${nextRank}` as Square;
}

function getBackwardSquare(square: Square, steps = 1): Square | null {
  const file = square[0];
  const rank = Number(square[1]);
  const nextRank = rank - steps;

  if (nextRank < 1 || nextRank > 8) {
    return null;
  }

  return `${file}${nextRank}` as Square;
}

function getPawnCaptureSquares(square: Square): Square[] {
  const fileIndex = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const nextRank = rank + 1;

  if (nextRank > 8) {
    return [];
  }

  return [fileIndex - 1, fileIndex + 1]
    .map((nextFileIndex) => {
      if (nextFileIndex < 0 || nextFileIndex > 7) {
        return null;
      }

      return `${String.fromCharCode(97 + nextFileIndex)}${nextRank}` as Square;
    })
    .filter((item): item is Square => item !== null);
}

function getBlackPawnCaptureSquares(square: Square): Square[] {
  const fileIndex = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const nextRank = rank - 1;

  if (nextRank < 1) {
    return [];
  }

  return [fileIndex - 1, fileIndex + 1]
    .map((nextFileIndex) => {
      if (nextFileIndex < 0 || nextFileIndex > 7) {
        return null;
      }

      return `${String.fromCharCode(97 + nextFileIndex)}${nextRank}` as Square;
    })
    .filter((item): item is Square => item !== null);
}

function getPawnCaptureOrigins(square: Square): Square[] {
  const fileIndex = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const previousRank = rank - 1;

  if (previousRank < 1) {
    return [];
  }

  return [fileIndex - 1, fileIndex + 1]
    .map((nextFileIndex) => {
      if (nextFileIndex < 0 || nextFileIndex > 7) {
        return null;
      }

      return `${String.fromCharCode(97 + nextFileIndex)}${previousRank}` as Square;
    })
    .filter((item): item is Square => item !== null);
}

function buildPawnPath(start: Square, steps: number): Square[] {
  return Array.from({ length: steps + 1 }, (_, index) => getForwardSquare(start, index)).filter(
    (square): square is Square => square !== null,
  );
}

function buildBlackPawnPath(start: Square, steps: number): Square[] {
  return Array.from({ length: steps + 1 }, (_, index) => getBackwardSquare(start, index)).filter(
    (square): square is Square => square !== null,
  );
}

function getModeForLevel(level: PracticeLevel): PracticeMode {
  switch (level) {
    case 1:
      return "single-target";
    case 2:
      return "path-target";
    case 3:
      return "path-target-with-obstacles";
    case 4:
    case 5:
      return "capture-target";
  }
}

function getStartSquareForPiece(piece: LessonPieceSymbol, level: PracticeLevel): Square {
  if (piece !== "P") {
    return getRandomSquare();
  }

  if (level === 4 || level === 5) {
    return getRandomSquare((square) => ["2", "3", "4", "5", "6"].includes(square[1]));
  }

  return getRandomSquare((square) => square.endsWith("2"));
}

function createStaticState(
  currentSquare: Square,
  targetSquare: Square,
  forbiddenSquares: Square[] = [],
  enemyPawnSquare: Square | null = null,
): ExerciseState {
  return {
    currentSquare,
    targetSquare,
    forbiddenSquares,
    enemyPawnSquare,
    enemyPawnPath: [],
    enemyPawnStep: 0,
    solved: false,
    failed: false,
  };
}

function createLevelOneState(piece: LessonPieceSymbol): ExerciseState {
  const currentSquare = getStartSquareForPiece(piece, 1);
  return createStaticState(currentSquare, getRandomReachableTarget(piece, currentSquare));
}

function createLevelTwoState(piece: LessonPieceSymbol): ExerciseState {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const currentSquare = getStartSquareForPiece(piece, 2);
    const targetSquare = getRandomSquare((square) => square !== currentSquare);
    const path = findShortestPath(piece, currentSquare, targetSquare, {
      mode: "path-target",
    });

    if (path && path.length >= 3) {
      return createStaticState(currentSquare, targetSquare);
    }
  }

  return createLevelOneState(piece);
}

function createLevelThreeState(piece: LessonPieceSymbol): ExerciseState {
  for (let attempt = 0; attempt < 250; attempt += 1) {
    const currentSquare = getStartSquareForPiece(piece, 3);
    const targetSquare = getRandomSquare((square) => square !== currentSquare);
    const forbiddenSquares = getRandomSquares(piece === "P" ? 6 : 8, [currentSquare, targetSquare]);
    const path = findShortestPath(piece, currentSquare, targetSquare, {
      mode: "path-target-with-obstacles",
      forbiddenSquares,
    });

    if (path && path.length >= 3) {
      return createStaticState(currentSquare, targetSquare, forbiddenSquares);
    }
  }

  return createLevelTwoState(piece);
}

function createLevelFourState(piece: LessonPieceSymbol): ExerciseState {
  if (piece === "P") {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const enemyPawnSquare = getRandomSquare((square) =>
        ["2", "3", "4", "5", "6", "7"].includes(square[1]),
      );
      const targets = getPawnCaptureOrigins(enemyPawnSquare);

      if (targets.length > 0) {
        const currentSquare = getRandomItem(targets);
        return createStaticState(currentSquare, enemyPawnSquare, [], enemyPawnSquare);
      }
    }
  }

  for (let attempt = 0; attempt < 250; attempt += 1) {
    const currentSquare = getStartSquareForPiece(piece, 4);
    const enemyPawnSquare = getRandomSquare(
      (square) => square !== currentSquare && isValidPawnSquare(square),
    );
    const path = findShortestPath(piece, currentSquare, enemyPawnSquare, {
      mode: "capture-target",
      captureTarget: enemyPawnSquare,
    });

    if (path && path.length >= 2) {
      return createStaticState(currentSquare, enemyPawnSquare, [], enemyPawnSquare);
    }
  }

  return createLevelOneState(piece);
}

function createLevelFiveState(piece: LessonPieceSymbol): ExerciseState {
  if (piece === "P") {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const enemyPawnSquare = getRandomSquare((square) =>
        ["4", "5", "6", "7"].includes(square[1]),
      );
      const maxPawnSteps = Number(enemyPawnSquare[1]) - 2;

      if (maxPawnSteps < 1) {
        continue;
      }

      const pawnSteps = Math.max(1, Math.min(maxPawnSteps, 1 + Math.floor(Math.random() * 3)));
      const enemyPawnPath = buildBlackPawnPath(enemyPawnSquare, pawnSteps);
      const finalEnemySquare = enemyPawnPath[enemyPawnPath.length - 1];

      if (!finalEnemySquare) {
        continue;
      }

      const captureOrigins = getPawnCaptureOrigins(finalEnemySquare).filter(
        (square) => Number(square[1]) === Number(enemyPawnSquare[1]) - pawnSteps - 1,
      );

      if (captureOrigins.length === 0) {
        continue;
      }

      const currentSquare = getRandomItem(captureOrigins);

      return {
        currentSquare,
        targetSquare: finalEnemySquare,
        forbiddenSquares: [],
        enemyPawnSquare,
        enemyPawnPath,
        enemyPawnStep: 0,
        solved: false,
        failed: false,
      };
    }

    return createLevelFourState(piece);
  }

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const enemyPawnSquare = getRandomSquare((square) => ["4", "5", "6", "7"].includes(square[1]));
    const maxPawnSteps = Number(enemyPawnSquare[1]) - 2;

    if (maxPawnSteps < 1) {
      continue;
    }

    const pawnSteps = Math.max(1, Math.min(maxPawnSteps, 1 + Math.floor(Math.random() * 3)));
    const captureSquare = getBackwardSquare(enemyPawnSquare, pawnSteps);

    if (!captureSquare) {
      continue;
    }

    const enemyPawnPath = buildBlackPawnPath(enemyPawnSquare, pawnSteps);
    const pawnPathSet = new Set(enemyPawnPath);
    const forbiddenSquares = getRandomSquares(piece === "N" ? 6 : 8, enemyPawnPath);

    for (let walkAttempt = 0; walkAttempt < 120; walkAttempt += 1) {
      let currentSquare: Square = captureSquare;
      let failedWalk = false;

      for (let step = 0; step < pawnSteps; step += 1) {
        const nextSquares = getPracticeReachableSquares(piece, currentSquare, {
          mode: "path-target-with-obstacles",
          forbiddenSquares,
        }).filter((square) => !pawnPathSet.has(square));

        if (nextSquares.length === 0) {
          failedWalk = true;
          break;
        }

        currentSquare = getRandomItem(nextSquares);
      }

      if (failedWalk || currentSquare === captureSquare) {
        continue;
      }

      const path = findShortestPath(piece, currentSquare, captureSquare, {
        mode: "path-target-with-obstacles",
        forbiddenSquares,
      });

      if (!path || path.length - 1 !== pawnSteps) {
        continue;
      }

      return {
        currentSquare,
        targetSquare: captureSquare,
        forbiddenSquares,
        enemyPawnSquare,
        enemyPawnPath,
        enemyPawnStep: 0,
        solved: false,
        failed: false,
      };
    }
  }

  return createLevelFourState(piece);
}

function createExerciseState(piece: LessonPieceSymbol, level: PracticeLevel): ExerciseState {
  switch (level) {
    case 1:
      return createLevelOneState(piece);
    case 2:
      return createLevelTwoState(piece);
    case 3:
      return createLevelThreeState(piece);
    case 4:
      return createLevelFourState(piece);
    case 5:
      return createLevelFiveState(piece);
  }
}

function cloneExerciseState(exercise: ExerciseState): ExerciseState {
  return {
    ...exercise,
    forbiddenSquares: [...exercise.forbiddenSquares],
    enemyPawnPath: [...exercise.enemyPawnPath],
  };
}

export function PieceLevelPractice({
  piece,
  boardId,
  restartToken = 0,
  newPositionToken = 0,
  level,
  onSolvedChange,
}: PieceLevelPracticeProps) {
  const overlayTimeoutRef = useRef<number | null>(null);
  const [initialExercise, setInitialExercise] = useState<ExerciseState>(() =>
    createExerciseState(piece, level),
  );
  const [exercise, setExercise] = useState<ExerciseState>(() =>
    cloneExerciseState(initialExercise),
  );
  const [overlay, setOverlay] = useState<PracticeOverlay>(null);

  const mode = getModeForLevel(level);

  const reachableSquares = useMemo(
    () =>
      getPracticeReachableSquares(piece, exercise.currentSquare, {
        mode,
        forbiddenSquares: exercise.forbiddenSquares,
        captureTarget: exercise.enemyPawnSquare,
      }),
    [exercise.currentSquare, exercise.enemyPawnSquare, exercise.forbiddenSquares, mode, piece],
  );

  useEffect(() => {
    const nextExercise = createExerciseState(piece, level);
    setInitialExercise(nextExercise);
    setExercise(cloneExerciseState(nextExercise));
  }, [level, piece, newPositionToken]);

  useEffect(() => {
    setExercise(cloneExerciseState(initialExercise));
  }, [initialExercise, restartToken]);

  useEffect(() => {
    onSolvedChange?.(exercise.solved);
  }, [exercise.solved, onSolvedChange]);

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current !== null) {
        window.clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  function showOverlay(
    type: "success" | "error" | "info",
    message: string,
    durationMs = 2600,
  ) {
    if (overlayTimeoutRef.current !== null) {
      window.clearTimeout(overlayTimeoutRef.current);
    }

    setOverlay({ type, message });
    overlayTimeoutRef.current = window.setTimeout(() => {
      setOverlay(null);
      overlayTimeoutRef.current = null;
    }, durationMs);
  }

  useEffect(() => {
    if (restartToken > 0) {
      showOverlay("info", "Позиция сброшена. Попробуйте еще раз.");
    }
  }, [restartToken]);

  useEffect(() => {
    if (newPositionToken > 0) {
      showOverlay("info", "Загружена новая позиция.");
    }
  }, [newPositionToken]);

  const pieces = [
    ...(!exercise.failed || exercise.enemyPawnSquare === null
      ? [getPiecePlacement(piece, exercise.currentSquare)]
      : []),
    ...(exercise.enemyPawnSquare ? [`p${exercise.enemyPawnSquare}`] : []),
  ];

  const highlightedSquares = exercise.solved
    ? []
    : exercise.enemyPawnSquare !== null
      ? [exercise.enemyPawnSquare]
      : [exercise.targetSquare];

  const customSquareStyles: SquareStyleMap = exercise.forbiddenSquares.reduce(
    (styles, square) => {
      styles[square] = {
        backgroundColor: "rgba(239, 68, 68, 0.32)",
        boxShadow: "inset 0 0 0 3px rgba(185, 28, 28, 0.55)",
      };

      return styles;
    },
    {} as SquareStyleMap,
  );

  return (
    <div className="space-y-5">
      <ChessBoard
        boardId={boardId}
        pieces={pieces}
        draggable={!exercise.solved && !exercise.failed}
        highlightedSquares={highlightedSquares}
        customSquareStyles={customSquareStyles}
        overlay={overlay}
        onPieceDrop={(sourceSquare, targetSquare) => {
          const isLegalMove =
            sourceSquare === exercise.currentSquare && reachableSquares.includes(targetSquare);

          if (!isLegalMove) {
            const reason =
              sourceSquare !== exercise.currentSquare
                ? "other"
                : getInvalidPracticeMoveReason(piece, sourceSquare, targetSquare, {
                    mode,
                    forbiddenSquares: exercise.forbiddenSquares,
                    captureTarget: exercise.enemyPawnSquare,
                  });

            showOverlay(
              "error",
              reason === "forbidden-target"
                ? "Вы не можете встать на запретное поле."
                : reason === "forbidden-cross"
                  ? "Вы не можете перепрыгнуть запретное поле! Нужно идти в обход."
                : reason === "piece-movement"
                  ? `${pieceErrorNames[piece]} так не ходит.`
                  : `${pieceErrorNames[piece]} так не ходит.`,
            );
            return false;
          }

          const capturedEnemyPawn = exercise.enemyPawnSquare === targetSquare;
          const nextPawnSquare = exercise.enemyPawnPath[exercise.enemyPawnStep + 1] ?? null;
          const interceptsNextPawnStep =
            !capturedEnemyPawn &&
            exercise.enemyPawnPath.length > 0 &&
            nextPawnSquare === targetSquare;
          const reachedStaticGoal =
            exercise.enemyPawnPath.length === 0 &&
            targetSquare === exercise.targetSquare;
          const isLevelOneFailure = level === 1 && !reachedStaticGoal;
          const enemyPawnCanCaptureFigure =
            piece !== "P" &&
            exercise.enemyPawnSquare !== null &&
            getBlackPawnCaptureSquares(exercise.enemyPawnSquare).includes(targetSquare);
          const advancedEnemyPawnSquare =
            piece !== "P" && exercise.enemyPawnSquare !== null
              ? getBackwardSquare(exercise.enemyPawnSquare)
              : null;
          const enemyPawnReachedEnd =
            piece !== "P" &&
            !capturedEnemyPawn &&
            !interceptsNextPawnStep &&
            !enemyPawnCanCaptureFigure &&
            advancedEnemyPawnSquare !== null &&
            advancedEnemyPawnSquare.endsWith("1");

          setExercise((current) => {
            const capturedEnemyPawn = current.enemyPawnSquare === targetSquare;
            const nextPawnSquare = current.enemyPawnPath[current.enemyPawnStep + 1] ?? null;
            const interceptsNextPawnStep =
              !capturedEnemyPawn && current.enemyPawnPath.length > 0 && nextPawnSquare === targetSquare;
            const reachedStaticGoal = current.enemyPawnPath.length === 0 && targetSquare === current.targetSquare;
            const enemyPawnCanCaptureFigure =
              piece !== "P" &&
              current.enemyPawnSquare !== null &&
              getBlackPawnCaptureSquares(current.enemyPawnSquare).includes(targetSquare);
            const advancedEnemyPawnSquare =
              piece !== "P" && current.enemyPawnSquare !== null
                ? getBackwardSquare(current.enemyPawnSquare)
                : null;
            const enemyPawnReachedEnd =
              piece !== "P" &&
              !capturedEnemyPawn &&
              !interceptsNextPawnStep &&
              !enemyPawnCanCaptureFigure &&
              advancedEnemyPawnSquare !== null &&
              advancedEnemyPawnSquare.endsWith("1");
            const failedByEnemyPawn = enemyPawnCanCaptureFigure || enemyPawnReachedEnd;

            return {
              ...current,
              currentSquare: targetSquare,
              enemyPawnSquare:
                capturedEnemyPawn || interceptsNextPawnStep
                  ? null
                  : enemyPawnCanCaptureFigure
                    ? targetSquare
                  : advancedEnemyPawnSquare ?? nextPawnSquare ?? current.enemyPawnSquare,
              enemyPawnStep:
                capturedEnemyPawn || interceptsNextPawnStep || enemyPawnCanCaptureFigure
                  ? current.enemyPawnStep
                  : advancedEnemyPawnSquare || nextPawnSquare
                    ? current.enemyPawnStep + 1
                    : current.enemyPawnStep,
              solved: capturedEnemyPawn || interceptsNextPawnStep || reachedStaticGoal,
              failed: isLevelOneFailure || failedByEnemyPawn,
            };
          });

          if (capturedEnemyPawn || interceptsNextPawnStep || reachedStaticGoal) {
            showOverlay("success", "Отлично! Задание выполнено правильно.", 3200);
          } else if (isLevelOneFailure) {
            showOverlay("error", "Не получилось. Попробуйте снова.", 3200);
          } else if (enemyPawnCanCaptureFigure) {
            showOverlay("error", "Пешка съела вашу фигуру. Попробуйте снова.", 3200);
          } else if (enemyPawnReachedEnd) {
            showOverlay("error", "Вы не смогли выполнить задание. Попробуйте еще раз.", 3200);
          }

          return true;
        }}
      />
    </div>
  );
}
