import Link from "next/link";
import { lessons } from "@/data/lesson-catalog";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/about" className="text-sm font-semibold tracking-[0.24em] text-emerald-700 uppercase">
          Chess Lessons
        </Link>

        <nav aria-label="Основная навигация">
          <ul className="flex items-center gap-2 sm:gap-4">
            <li>
              <Link
                href="/about"
                className="inline-flex rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                About
              </Link>
            </li>
            <li className="group relative">
              <Link
                href="/lessons"
                className="inline-flex rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                Lessons
              </Link>

              <div className="pointer-events-none absolute right-0 top-full pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="w-80 rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_24px_60px_rgba(28,25,23,0.12)]">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                    Уроки
                  </p>
                  <ul className="space-y-1">
                    {lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className="block rounded-2xl px-3 py-3 transition hover:bg-stone-100"
                        >
                          <span className="block text-sm font-semibold text-stone-900">
                            {lesson.title}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-stone-600">
                            {lesson.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
