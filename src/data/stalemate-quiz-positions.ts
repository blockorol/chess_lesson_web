import type { BoardPosition } from "@/types/chessboard";

export type StalemateQuizPosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  isStalemate: boolean;
  explanation: string;
};

export const stalemateQuizPositions: StalemateQuizPosition[] = [
  {
    "id": "4201533ca3c9",
    "position": {
      "g8": "wK",
      "g6": "bK",
      "f6": "bQ",
      "h6": "bQ"
    },
    "sideToMove": "white",
    "explanation": "",
    "isStalemate": true
  },
  {
    "id": "9c6d71f254a0",
    "position": {
      "g5": "wK",
      "h6": "bR",
      "f6": "bR",
      "g3": "bK"
    },
    "sideToMove": "white",
    "explanation": "",
    "isStalemate": true
  },
  {
    "id": "0bda78ca38fb",
    "position": {
      "f6": "bR",
      "h6": "bR",
      "g3": "bK",
      "g5": "wK"
    },
    "sideToMove": "black",
    "explanation": "внимально!\nтут ходят черные - у них много вариантов как избежать пата",
    "isStalemate": false
  },
  {
    "id": "9d32e44d89d2",
    "position": {
      "f1": "wK",
      "f3": "bK",
      "h3": "bN",
      "d3": "bN"
    },
    "sideToMove": "white",
    "explanation": "",
    "isStalemate": true
  },
  {
    "id": "f2d0ae3dda98",
    "position": {
      "f7": "bN",
      "g8": "wK",
      "h6": "bB",
      "e4": "bQ",
      "g1": "bK"
    },
    "sideToMove": "white",
    "explanation": "Король может съеть коня",
    "isStalemate": false
  },
  {
    "id": "6527ef47ff8d",
    "position": {
      "g8": "bK",
      "g7": "wP",
      "g6": "wP",
      "f6": "wP",
      "g4": "wK"
    },
    "sideToMove": "black",
    "explanation": "Пешки едят по диагонали - так что черному королю не куда ходить",
    "isStalemate": true
  },
  {
    "id": "6c3ee758efa7",
    "position": {
      "g8": "bK",
      "g7": "wP",
      "f6": "wP",
      "g6": "wP",
      "g4": "wK",
      "e2": "bP",
      "h6": "wP"
    },
    "sideToMove": "black",
    "explanation": "Хоть у черного короля и нет ходов, но у черных есть пешка которая может ходить",
    "isStalemate": false
  },
  {
    "id": "e3f26bc8ecb5",
    "position": {
      "e2": "wP",
      "d3": "wP",
      "e3": "wP",
      "f3": "wP",
      "e1": "bK",
      "h8": "wK"
    },
    "sideToMove": "black",
    "explanation": "Пешки едят по диагонали, но только вперед. так что черный король может ходить куда угодно (и даже съесть одну из пешек)",
    "isStalemate": false
  },
  {
    "id": "f92b0724365c",
    "position": {
      "f1": "wK",
      "e2": "bR",
      "g3": "bR",
      "d3": "bK"
    },
    "sideToMove": "white",
    "explanation": "",
    "isStalemate": true
  },
  {
    "id": "e76c2de854d7",
    "position": {
      "e8": "wK",
      "h8": "bK",
      "g6": "wR",
      "f4": "wB"
    },
    "sideToMove": "black",
    "explanation": "",
    "isStalemate": true
  },
  {
    "id": "9bf29a6f5925",
    "position": {
      "d8": "wK",
      "g8": "bK",
      "d7": "bB",
      "d6": "bQ"
    },
    "sideToMove": "white",
    "explanation": "",
    "isStalemate": true
  },
  {
    "id": "1a262fb71ce4",
    "position": {
      "d8": "wK",
      "d1": "bK",
      "e2": "wR",
      "c3": "wQ"
    },
    "sideToMove": "black",
    "explanation": "Король может съесть ладью",
    "isStalemate": true
  }
];
