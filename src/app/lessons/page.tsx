import type { Metadata } from "next";
import { LessonCard } from "@/components/lesson-card";
import { lessons } from "@/data/lesson-catalog";

export const metadata: Metadata = {
  title: "Lessons | Chess Lessons",
  description: "Список уроков для изучения шахмат шаг за шагом.",
};

export default function LessonsPage() {
  return (
    <main className="px-0 py-10 text-stone-900 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-6xl">
        <div className="px-4 sm:px-0">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-700">
            Lessons
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Набор уроков
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:mt-6 sm:text-lg sm:leading-8">
            Здесь будет собрана последовательная программа обучения: от самых
            первых правил до тактических и позиционных идей.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </section>
    </main>
  );
}
