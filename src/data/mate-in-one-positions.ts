import type { BoardPosition } from "@/types/chessboard";

export type MateInOnePosition = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  exampleAnswer: {
    from: string;
    to: string;
  };
  explanation: string;
};

export const mateInOnePositions: MateInOnePosition[] = [
  {
    "id": "cc8d68aaf8a3",
    "position": {
      "h2": "wP",
      "g2": "wP",
      "f2": "wP",
      "h7": "bP",
      "g7": "bP",
      "f7": "bP",
      "g8": "bK",
      "d6": "wR",
      "g1": "wK"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "d6",
      "to": "d8"
    }
  },
  {
    "id": "3c0827ed1266",
    "position": {
      "g4": "wR",
      "f3": "wR",
      "h6": "bK",
      "c6": "wK"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "f3",
      "to": "h3"
    }
  },
  {
    "id": "9b3eed9b1316",
    "position": {
      "c8": "wK",
      "a4": "bB",
      "a5": "bB",
      "e5": "bQ",
      "c7": "wP",
      "g1": "bK"
    },
    "sideToMove": "black",
    "explanation": "",
    "exampleAnswer": {
      "from": "e5",
      "to": "c7"
    }
  },
  {
    "id": "6d8b0d6a6b1d",
    "position": {
      "d5": "wK",
      "h8": "bK",
      "h5": "wR",
      "d7": "wQ",
      "h7": "bP",
      "b2": "bQ",
      "a3": "wN",
      "a4": "wN",
      "c2": "wP",
      "a2": "wP"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "d7",
      "to": "h7"
    }
  },
  {
    "id": "80953ad9fa08",
    "position": {
      "b8": "bK",
      "b1": "wK",
      "a2": "wP",
      "b2": "wP",
      "c2": "wP",
      "e2": "wP",
      "f2": "wP",
      "g3": "wP",
      "h2": "wP",
      "f7": "bP",
      "g7": "bP",
      "h7": "bP",
      "c7": "bP",
      "a7": "bP",
      "b6": "bP",
      "e7": "bB",
      "g2": "wB",
      "f3": "wQ",
      "f5": "bQ"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "f3",
      "to": "b7"
    }
  },
  {
    "id": "593d33797bf0",
    "position": {
      "a8": "bK",
      "b7": "bP",
      "b8": "bR",
      "d4": "wR",
      "d3": "wR",
      "d2": "wR",
      "d1": "wR",
      "d5": "wR",
      "d6": "wR",
      "f6": "bB",
      "g6": "bB",
      "h6": "bB",
      "g1": "wK",
      "h2": "wP",
      "g2": "wP",
      "f2": "wP"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "d5",
      "to": "a5"
    }
  },
  {
    "id": "68da655ff932",
    "position": {
      "b7": "bP",
      "a7": "bP",
      "c7": "bP",
      "c6": "bP",
      "b6": "bK",
      "c5": "bP",
      "b5": "bP",
      "a5": "bP",
      "a6": "bP",
      "e7": "wN"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "e7",
      "to": "c8"
    }
  },
  {
    "id": "6a6367d5b80f",
    "position": {
      "d7": "wN",
      "d6": "wN",
      "d5": "wN",
      "e5": "wN",
      "e6": "wN",
      "e7": "wN",
      "f7": "wN",
      "f6": "wN",
      "f5": "wN",
      "g5": "wN",
      "g6": "wN",
      "g7": "wN",
      "h7": "wN",
      "h6": "wN",
      "h5": "wN",
      "h4": "wN",
      "f4": "wN",
      "e4": "wN",
      "d4": "wN",
      "d3": "wN",
      "e3": "wN",
      "f3": "wN",
      "g3": "wN",
      "g4": "wN",
      "h3": "wN",
      "h2": "wN",
      "g2": "wN",
      "f2": "wN",
      "e2": "wN",
      "d2": "wN",
      "d1": "wN",
      "e1": "wN",
      "f1": "wN",
      "g1": "wN",
      "h1": "wN",
      "d8": "wN",
      "e8": "wN",
      "f8": "wN",
      "g8": "wN",
      "h8": "wK",
      "a1": "bK",
      "a2": "bP"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "e1",
      "to": "c2"
    }
  },
  {
    "id": "6ffa6d38118e",
    "position": {
      "b3": "wB",
      "c3": "wB",
      "b1": "wK",
      "a2": "wP",
      "b2": "wP",
      "c2": "wP",
      "h3": "bR",
      "g8": "bK",
      "f7": "bP",
      "g7": "bP",
      "d2": "wP"
    },
    "sideToMove": "black",
    "explanation": "",
    "exampleAnswer": {
      "from": "h3",
      "to": "h1"
    }
  },
  {
    "id": "3af224168b2d",
    "position": {
      "b7": "wQ",
      "a6": "wB",
      "d7": "bP",
      "e7": "bP",
      "f7": "bP",
      "h3": "bP",
      "d8": "bK",
      "e8": "bR",
      "g8": "bQ",
      "h1": "wK",
      "c8": "bN"
    },
    "sideToMove": "white",
    "explanation": "",
    "exampleAnswer": {
      "from": "b7",
      "to": "c8"
    }
  }
];
