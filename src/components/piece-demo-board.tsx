"use client";

import { useMemo, useState } from "react";
import { ChessBoard } from "@/components/chess-board";
import {
  getPiecePlacement,
  getRandomSquare,
  getReachableSquares,
  type BoardArrow,
  type LessonPieceSymbol,
} from "@/lib/chess";
import type { Square } from "@/types/chessboard";
import type { LessonDemo } from "@/types/lesson";

type PieceDemoBoardProps = {
  demo: LessonDemo;
  boardId: string;
};

function DemoBoardForGeneratedPiece({
  piece,
  boardId,
}: {
  piece: LessonPieceSymbol;
  boardId: string;
}) {
  const [square, setSquare] = useState(() =>
    getRandomSquare(piece === "P" ? (candidate) => !candidate.endsWith("8") : undefined),
  );

  const arrows = useMemo<BoardArrow[]>(
    () =>
      getReachableSquares(piece, square).map((target) => ({
        from: square,
        to: target,
      })),
    [piece, square],
  );

  return (
    <div className="space-y-4">
      <ChessBoard
        boardId={boardId}
        pieces={[getPiecePlacement(piece, square)]}
        arrows={arrows}
      />
      <button
        type="button"
        onClick={() =>
          setSquare(
            getRandomSquare(
              piece === "P" ? (candidate) => !candidate.endsWith("8") : undefined,
            ),
          )
        }
        className="inline-flex rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
      >
        Поставить на случайное поле
      </button>
    </div>
  );
}

export function PieceDemoBoard({ demo, boardId }: PieceDemoBoardProps) {
  if (demo.type === "generated-piece") {
    return <DemoBoardForGeneratedPiece piece={demo.piece} boardId={boardId} />;
  }

  return (
    <ChessBoard
      boardId={boardId}
      pieces={demo.placements}
      arrows={demo.arrows.map((arrow) => ({
        from: arrow.from as Square,
        to: arrow.to as Square,
        color: arrow.color,
      }))}
    />
  );
}
