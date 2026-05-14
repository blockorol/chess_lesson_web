import Link from "next/link";

export function NotFoundContent() {
  return (
    <main className="min-h-screen bg-stone-100 px-0 py-10 text-stone-900 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-12 lg:px-12">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-amber-700">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Страница не найдена
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:mt-6 sm:text-lg sm:leading-8">
          Похоже, такого адреса у нас пока нет. Вернитесь на главную или
          перейдите на страницу о проекте.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            На главную
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            О проекте
          </Link>
        </div>
      </section>
    </main>
  );
}
