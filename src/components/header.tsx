"use client";

import Link from "next/link";
import { useState } from "react";
import { lessons } from "@/data/lesson-catalog";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLessonsOpen, setIsMobileLessonsOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileLessonsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/about"
          className="text-xs font-semibold tracking-[0.22em] text-emerald-700 uppercase sm:text-sm sm:tracking-[0.24em]"
          onClick={closeMobileMenu}
        >
          Chess Lessons
        </Link>

        <button
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-xl text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 md:hidden"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          {isMobileMenuOpen ? "×" : "≡"}
        </button>

        <nav aria-label="Основная навигация" className="hidden md:block">
          <ul className="flex items-center gap-2 lg:gap-4">
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

      {isMobileMenuOpen ? (
        <div id="mobile-menu" className="border-t border-stone-200 bg-white md:hidden">
          <nav aria-label="Мобильная навигация" className="mx-auto max-w-6xl px-4 py-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
                  onClick={closeMobileMenu}
                >
                  <span>About</span>
                </Link>
              </li>
              <li className="rounded-2xl border border-stone-200 bg-stone-50">
                <div className="flex items-center">
                  <Link
                    href="/lessons"
                    className="flex-1 px-4 py-3 text-sm font-medium text-stone-800"
                    onClick={closeMobileMenu}
                  >
                    Lessons
                  </Link>
                  <button
                    type="button"
                    aria-expanded={isMobileLessonsOpen}
                    aria-label={
                      isMobileLessonsOpen ? "Скрыть список уроков" : "Показать список уроков"
                    }
                    className="px-4 py-3 text-lg text-stone-600"
                    onClick={() => setIsMobileLessonsOpen((current) => !current)}
                  >
                    {isMobileLessonsOpen ? "−" : "+"}
                  </button>
                </div>

                {isMobileLessonsOpen ? (
                  <ul className="space-y-1 border-t border-stone-200 px-2 py-2">
                    {lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className="block rounded-xl px-3 py-3 transition hover:bg-white"
                          onClick={closeMobileMenu}
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
                ) : null}
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
