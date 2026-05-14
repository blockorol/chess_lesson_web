import type { BoardPosition } from "@/types/chessboard";

export type MateQuizPosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  isMate: boolean;
  explanation: string;
};

export type MateInOnePosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  answer: {
    from: string;
    to: string;
  };
  explanation: string;
};

// Add up to 30 curated positions here as the lesson grows.
export const mateQuizPositions: MateQuizPosition[] = [];

// Add up to 30 curated "mate in 1" positions here as the lesson grows.
export const mateInOnePositions: MateInOnePosition[] = [];
