import Link from "next/link";
import type { Lesson } from "@/types/lesson";

type LessonCardProps = {
  lesson: Lesson;
};

export function LessonCard({ lesson }: LessonCardProps) {
  const isInDevelopment = lesson.status === "in-development";

  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            isInDevelopment
              ? "border-stone-200 bg-stone-100 text-stone-600"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {isInDevelopment ? "В разработке" : "Доступен"}
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
        {lesson.title}
      </h2>
      <p className="mt-3 text-base leading-7 text-stone-600">
        {lesson.short_description}
      </p>
      <Link
        href={`/lessons/${lesson.slug}`}
        className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
      >
        Открыть урок
      </Link>
    </article>
  );
}
