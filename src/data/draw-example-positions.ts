import type { BoardPosition } from "@/types/chessboard";

export type DrawExamplePosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  caption: string;
};

export const drawExamplePositions: DrawExamplePosition[] = [
  {
    "id": "4a4a8fe28171",
    "position": {
      "h8": "wK",
      "f7": "bK",
      "d7": "bB"
    },
    "sideToMove": "white",
    "caption": ""
  },
  {
    "id": "07aee0541b76",
    "position": {
      "h7": "wK",
      "e3": "bK"
    },
    "sideToMove": "white",
    "caption": ""
  },
  {
    "id": "8d060f30024d",
    "position": {
      "f3": "bK",
      "h1": "wK",
      "h4": "bP"
    },
    "sideToMove": "white",
    "caption": ""
  },
  {
    "id": "a4ac92a3b134",
    "position": {
      "h3": "wP",
      "g3": "wP",
      "h1": "wK",
      "h8": "bK",
      "g6": "wQ",
      "e7": "wR",
      "f2": "bQ",
      "d7": "wR"
    },
    "sideToMove": "black",
    "caption": ""
  }
];
