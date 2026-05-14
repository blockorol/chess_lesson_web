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
    <div className="mt-10 space-y-4 sm:mt-14 sm:space-y-5">
      {subtopics.map((subtopic, index) => (
        <details
          key={subtopic.slug}
          open={index === 0}
          className="group rounded-[2rem] border border-stone-200 bg-white px-0 py-4 shadow-sm sm:p-6"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 sm:px-0">
            <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
              {subtopic.title}
            </h3>
            <span className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-500 transition group-open:rotate-45">
              +
            </span>
          </summary>

          <div className="mt-6 sm:mt-8">
            <LessonPieceMoveLevels lessonSlug={lessonSlug} subtopic={subtopic} />
          </div>
        </details>
      ))}
    </div>
  );
}
