import type { BoardPosition } from "@/types/chessboard";

export type MateQuizPosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  isMate: boolean;
  explanation: string;
};

export const mateQuizPositions: MateQuizPosition[] = [
  {
    "id": "3052585b7187",
    "position": {
      "h7": "wP",
      "g7": "wP",
      "f7": "wP",
      "g8": "wK",
      "d8": "bR",
      "g1": "bK",
      "h2": "bP",
      "g2": "bP",
      "f2": "bP",
      "c6": "wR"
    },
    "sideToMove": "black",
    "explanation": "",
    "isMate": true
  },
  {
    "id": "aef7501e01c8",
    "position": {
      "h7": "wP",
      "g7": "wP",
      "f7": "wP",
      "g8": "wK",
      "e4": "wR",
      "d8": "bR",
      "h2": "bP",
      "f2": "bP",
      "h1": "bK",
      "b7": "wB"
    },
    "sideToMove": "white",
    "explanation": "Это не мат, так как белая ладья может встать на пути черной ладьи",
    "isMate": false
  },
  {
    "id": "08aad5146709",
    "position": {},
    "sideToMove": "white",
    "explanation": "",
    "isMate": false
  },
  {
    "id": "efd07ec7394d",
    "position": {
      "f7": "wP",
      "g6": "wP",
      "h7": "wP",
      "g8": "wK",
      "f6": "bB",
      "g7": "bQ",
      "h2": "bP",
      "g2": "bP",
      "f2": "bP",
      "e1": "bK",
      "e3": "bP",
      "h1": "bR",
      "c2": "bP",
      "b2": "bP",
      "a2": "bP",
      "b1": "bR",
      "c3": "bN",
      "f3": "bN",
      "e8": "wR",
      "e7": "wR",
      "d7": "wQ",
      "c7": "wP",
      "b7": "wP",
      "a7": "wP",
      "c6": "wN",
      "c4": "wN",
      "g4": "wB"
    },
    "sideToMove": "black",
    "explanation": "Ферзь пригвоздил короля. Король не может съесть ферзя, так как тот защищен слоном",
    "isMate": true
  },
  {
    "id": "b70cea4dc886",
    "position": {
      "d5": "wK",
      "g6": "bR",
      "g3": "bB",
      "a4": "bN",
      "h4": "bQ",
      "e7": "bN",
      "c7": "wP",
      "b7": "wP",
      "a7": "wP",
      "a3": "wR",
      "f2": "wQ",
      "h1": "bK",
      "e3": "wN",
      "h8": "wR",
      "a2": "bP",
      "c2": "bP",
      "a5": "bP",
      "h2": "bP"
    },
    "sideToMove": "black",
    "explanation": "Конь на краю доски, слон, ладья и фезрь черных перекрывают все поля куда может отойти белый король, а второй конь - атакует короля",
    "isMate": true
  },
  {
    "id": "a96a2909902d",
    "position": {
      "d5": "wK",
      "h6": "bQ",
      "g5": "bR",
      "f4": "bR",
      "h1": "bK",
      "d8": "wB",
      "a2": "bP",
      "b2": "bP",
      "c2": "bP",
      "a7": "wP",
      "b7": "wP",
      "c7": "wP"
    },
    "sideToMove": "white",
    "explanation": "Слон может съесть ладью которая нападает.",
    "isMate": false
  },
  {
    "id": "7da80ffa7281",
    "position": {
      "g2": "wB",
      "h2": "wB",
      "a8": "bK",
      "a6": "wK"
    },
    "sideToMove": "black",
    "explanation": "черному королю не куда ходить",
    "isMate": true
  },
  {
    "id": "4e0c61fefb74",
    "position": {
      "g7": "wR",
      "h6": "wR",
      "h8": "wK",
      "f7": "bN",
      "f5": "bQ",
      "d8": "bK",
      "e7": "bP",
      "d7": "bP",
      "c7": "bP",
      "f6": "bN"
    },
    "sideToMove": "white",
    "explanation": "нет, ладья может съесть коня, который дает шах",
    "isMate": false
  },
  {
    "id": "3ca34296d141",
    "position": {
      "g8": "bK",
      "d7": "bP",
      "c7": "bP",
      "b7": "bP",
      "a7": "bP",
      "f3": "wR",
      "b3": "wB",
      "g7": "bP",
      "d6": "bB",
      "h3": "wR",
      "a1": "wK",
      "a2": "wP",
      "b2": "wP",
      "c2": "wP",
      "c3": "wP",
      "f2": "bR",
      "h2": "bR"
    },
    "sideToMove": "black",
    "explanation": "ладьи отрезают короля, а слон нападает на него",
    "isMate": true
  },
  {
    "id": "231977efd736",
    "position": {
      "h3": "bK",
      "f3": "wK",
      "h6": "wR"
    },
    "sideToMove": "black",
    "explanation": "король блокирует все ходы, ладья атакует короля",
    "isMate": true
  }
];
