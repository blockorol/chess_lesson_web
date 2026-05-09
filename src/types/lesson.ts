export type LessonLevel = "beginner" | "intermediate" | "advanced";

export type PieceLessonSymbol =
  | "K"
  | "Q"
  | "R"
  | "B"
  | "N"
  | "P"
  | "S";

export type BoardArrowInput = {
  from: string;
  to: string;
  color?: string;
};
export type LessonDemo =
  | {
      type: "generated-piece";
      piece: Exclude<PieceLessonSymbol, "S">;
      notes: string[];
    }
  | {
      type: "custom-position";
      placements: string[];
      arrows: BoardArrowInput[];
      notes: string[];
    };

export type LessonPractice =
  | {
      type: "piece-target";
      piece: Exclude<PieceLessonSymbol, "S">;
      description: string;
    }
  | {
      type: "coming-soon";
      description: string;
    };

export type LessonSubtopic = {
  slug: string;
  title: string;
  piece: PieceLessonSymbol;
  figureName: string;
  figureGlyph: string;
  description: string[];
  movementDescription: string[];
  demo: LessonDemo;
  practice: LessonPractice;
};

export type Lesson = {
  slug: string;
  title: string;
  description: string;
  level: LessonLevel;
  content: string[];
  subtopics?: LessonSubtopic[];
};
