import type { BoardPosition } from "@/types/chessboard";

export type StalemateExamplePosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  explanation: string;
};

export type StalemateQuizPosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  isStalemate: boolean;
  explanation: string;
};

// Add up to 30 curated stalemate examples here as the lesson grows.
export const stalemateExamplePositions: StalemateExamplePosition[] = [];

// Add up to 30 curated stalemate quiz positions here as the lesson grows.
export const stalemateQuizPositions: StalemateQuizPosition[] = [];
