"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  arrowsToReactChessboard,
  placementsToPosition,
  type SquareStyleMap,
  type BoardArrow,
  type PiecePlacement,
} from "@/lib/chess";
import type { Square } from "@/types/chessboard";

type ChessBoardProps = {
  pieces: PiecePlacement[];
  arrows?: BoardArrow[];
  orientation?: "white" | "black";
  draggable?: boolean;
  boardId: string;
  onPieceDrop?: (sourceSquare: Square, targetSquare: Square) => boolean;
  highlightedSquares?: Square[];
  customSquareStyles?: SquareStyleMap;
  overlay?: {
    type: "success" | "error" | "info";
    message: string;
  } | null;
};

export function ChessBoard({
  pieces,
  arrows = [],
  orientation = "white",
  draggable = false,
  boardId,
  onPieceDrop,
  highlightedSquares = [],
  customSquareStyles = {},
  overlay = null,
}: ChessBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const resizeBoard = () => {
      const nextWidth = Math.floor(Math.min(element.getBoundingClientRect().width, 320));
      setBoardWidth(Math.max(nextWidth, 1));
    };

    resizeBoard();

    const observer = new ResizeObserver(resizeBoard);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const highlightedSquareStyles = highlightedSquares.reduce<Record<string, CSSProperties>>(
    (styles, square) => {
    styles[square] = {
      boxShadow: "inset 0 0 0 4px rgba(5, 150, 105, 0.9)",
      borderRadius: "0px",
    };

    return styles;
  },
    {},
  );

  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-full touch-none select-none justify-center overflow-hidden"
    >
      {boardWidth ? (
        <Chessboard
          id={boardId}
          position={placementsToPosition(pieces)}
          boardWidth={boardWidth}
          boardOrientation={orientation}
          arePiecesDraggable={draggable}
          areArrowsAllowed={false}
          customDndBackend={TouchBackend}
          customDndBackendOptions={{
            enableMouseEvents: true,
            touchSlop: 0,
            delayTouchStart: 0,
          }}
          customArrows={arrowsToReactChessboard(arrows)}
          customArrowColor="rgba(217, 119, 6, 0.85)"
          customDarkSquareStyle={{ backgroundColor: "#9a7b4f" }}
          customLightSquareStyle={{ backgroundColor: "#f4e7cf" }}
          customBoardStyle={{
            boxShadow: "0 18px 48px rgba(28, 25, 23, 0.16)",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onPieceDrop={
            onPieceDrop
              ? (sourceSquare, targetSquare) => {
                  if (!targetSquare) {
                    return false;
                  }

                  return onPieceDrop(sourceSquare, targetSquare);
                }
              : undefined
          }
          customSquareStyles={{
            ...customSquareStyles,
            ...highlightedSquareStyles,
          }}
        />
      ) : (
        <div className="aspect-square w-full max-w-[320px]" />
      )}
      {overlay ? (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur ${
              overlay.type === "success"
                ? "bg-emerald-600/92 text-white"
                : overlay.type === "error"
                  ? "bg-rose-600/92 text-white"
                  : "bg-stone-900/88 text-stone-50"
            }`}
          >
            {overlay.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
