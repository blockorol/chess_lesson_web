import type { Lesson } from "@/types/lesson";
import { howPiecesMove } from "@/data/lessons/how-pieces-move";
import { checkAndCheckmate } from "@/data/lessons/check-and-checkmate";
import { howToSolveChessPuzzles } from "@/data/lessons/how-to-solve-chess-puzzles";
import { howToPlayTheOpening } from "@/data/lessons/how-to-play-the-opening";
import { howToCheckmate } from "@/data/lessons/how-to-checkmate";
import { howToPlayIfYouCantPlay } from "@/data/lessons/how-to-play-if-you-cant-play";
import { threeSimpleQuestions } from "@/data/lessons/three-simple-questions";

export const lessons: Lesson[] = [
  howPiecesMove,
  checkAndCheckmate,
  howToSolveChessPuzzles,
  howToPlayTheOpening,
  howToCheckmate,
  howToPlayIfYouCantPlay,
  threeSimpleQuestions,
];
