import { LessonPieceMoveLevels } from "@/components/lesson-piece-move-levels";
import type { LessonSubtopic } from "@/types/lesson";

type LessonSubtopicsProps = {
  lessonSlug: string;
  subtopics: LessonSubtopic[];
};

export function LessonSubtopics({
  lessonSlug,
  subtopics,
}: LessonSubtopicsProps) {
  return (
    <div className="mt-14 space-y-5">
      {subtopics.map((subtopic, index) => (
        <details
          key={subtopic.slug}
          open={index === 0}
          className="group rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
              {subtopic.title}
            </h3>
            <span className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-500 transition group-open:rotate-45">
              +
            </span>
          </summary>

          <div className="mt-8">
            <LessonPieceMoveLevels lessonSlug={lessonSlug} subtopic={subtopic} />
          </div>
        </details>
      ))}
    </div>
  );
}
