export type PositionDatasetId =
  | "mateQuiz"
  | "mateInOne"
  | "stalemateExamples"
  | "stalemateQuiz"
  | "drawExamples";

export type PositionDatasetKind = "display" | "quiz" | "mate-in-one";

export type PositionDatasetConfig = {
  id: PositionDatasetId;
  title: string;
  description: string;
  kind: PositionDatasetKind;
  exportName: string;
  typeName: string;
  filePath: string;
};

export const positionDatasetConfigs: PositionDatasetConfig[] = [
  {
    id: "mateQuiz",
    title: "Определите, мат ли это",
    description: "Набор из 30 позиций для src/data/mate-quiz-positions.ts.",
    kind: "quiz",
    exportName: "mateQuizPositions",
    typeName: "MateQuizPosition",
    filePath: "src/data/mate-quiz-positions.ts",
  },
  {
    id: "mateInOne",
    title: "Поставьте мат в 1 ход",
    description: "Набор из 30 позиций с примером правильного хода для src/data/mate-in-one-positions.ts.",
    kind: "mate-in-one",
    exportName: "mateInOnePositions",
    typeName: "MateInOnePosition",
    filePath: "src/data/mate-in-one-positions.ts",
  },
  {
    id: "stalemateExamples",
    title: "Примеры с патом",
    description: "Набор из 30 позиций для src/data/stalemate-example-positions.ts.",
    kind: "display",
    exportName: "stalemateExamplePositions",
    typeName: "StalemateExamplePosition",
    filePath: "src/data/stalemate-example-positions.ts",
  },
  {
    id: "stalemateQuiz",
    title: "Определите, пат или не пат",
    description: "Набор тестовых позиций для src/data/stalemate-quiz-positions.ts.",
    kind: "quiz",
    exportName: "stalemateQuizPositions",
    typeName: "StalemateQuizPosition",
    filePath: "src/data/stalemate-quiz-positions.ts",
  },
  {
    id: "drawExamples",
    title: "Другой вариант ничьей",
    description: "Карусель примеров ничьей с подписью для src/data/draw-example-positions.ts.",
    kind: "display",
    exportName: "drawExamplePositions",
    typeName: "DrawExamplePosition",
    filePath: "src/data/draw-example-positions.ts",
  },
];

export function getPositionDatasetConfig(id: string) {
  return positionDatasetConfigs.find((dataset) => dataset.id === id);
}
