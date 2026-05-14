import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckAndCheckmateLesson } from "@/components/check-and-checkmate-lesson";
import { LessonIntro } from "@/components/lesson-intro";
import { LessonSubtopics } from "@/components/lesson-subtopics";
import { MaterialAdvantageLesson } from "@/components/material-advantage-lesson";
import { OpeningLesson } from "@/components/opening-lesson";
import { ThreeSimpleQuestionsLesson } from "@/components/three-simple-questions-lesson";
import { lessons } from "@/data/lesson-catalog";

type LessonPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    admin?: string;
  }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = lessons.find((item) => item.slug === slug);

  if (!lesson) {
    return {
      title: "Lesson Not Found | Chess Lessons",
    };
  }

  return {
    title: `${lesson.title} | Chess Lessons`,
    description: lesson.short_description,
  };
}

export function generateStaticParams() {
  return lessons.map((lesson) => ({
    slug: lesson.slug,
  }));
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const lesson = lessons.find((item) => item.slug === slug);

  if (!lesson) {
    notFound();
  }

  return (
    <main className="px-0 py-10 text-stone-900 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-12 lg:px-12">
        <Link
          href="/lessons"
          className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
        >
          ← Все уроки
        </Link>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone-600">
          {lesson.short_description}
        </p>

        {lesson.slug === "how-to-play-the-opening" ? (
          <OpeningLesson />
        ) : lesson.slug === "material-advantage-to-win" ? (
          <MaterialAdvantageLesson />
        ) : lesson.slug === "three-simple-questions" ? (
          <ThreeSimpleQuestionsLesson />
        ) : lesson.slug === "check-and-checkmate" ? (
          <>
            <LessonIntro slug={lesson.slug} content={lesson.content} />
            <CheckAndCheckmateLesson showAdminLinks={resolvedSearchParams.admin === "true"} />
          </>
        ) : lesson.subtopics ? (
          <>
            <LessonIntro slug={lesson.slug} content={lesson.content} />
            <LessonSubtopics lessonSlug={lesson.slug} subtopics={lesson.subtopics} />
          </>
        ) : (
          <>
            <LessonIntro slug={lesson.slug} content={lesson.content} />
            <section className="mt-10 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Soon
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
                Урок в разработке
              </h2>
              <p className="mt-3 text-base leading-7 text-stone-600">
                Скоро здесь появятся примеры, разбор позиций и практические задания.
              </p>
            </section>
          </>
        )}
      </article>
    </main>
  );
}
