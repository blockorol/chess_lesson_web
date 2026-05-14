import type { Lesson } from "@/types/lesson";
import { howPiecesMove } from "@/data/lessons/how-pieces-move";
import { checkAndCheckmate } from "@/data/lessons/check-and-checkmate";
import { howToPlayTheOpening } from "@/data/lessons/how-to-play-the-opening";
import { threeSimpleQuestions } from "@/data/lessons/three-simple-questions";
import { materialAdvantageToWin } from "@/data/lessons/material-advantage-to-win";
import { howToCheckmate } from "@/data/lessons/how-to-checkmate";
import { calculateSeveralMoves } from "@/data/lessons/calculate-several-moves";
import { howToSolveChessPuzzles } from "@/data/lessons/how-to-solve-chess-puzzles";

export const lessons: Lesson[] = [
  howPiecesMove,
  checkAndCheckmate,
  howToPlayTheOpening,
  threeSimpleQuestions,
  materialAdvantageToWin,
  howToCheckmate,
  calculateSeveralMoves,
  howToSolveChessPuzzles,
];
