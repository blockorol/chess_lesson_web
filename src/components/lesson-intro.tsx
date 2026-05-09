type LessonIntroProps = {
  slug: string;
  content: string[];
};

const howPiecesMoveIntro = {
  intro: [
    "В этом уроке мы разберем, как ходит каждая фигура и чем они отличаются друг от друга.",
    "Самый простой способ выучить ходы фигур — идти по шагам: сначала посмотреть на фигуру, затем понять схему ее хода и только после этого закрепить все на практике.",
  ],
  steps: [
    "Сначала нужно понять, как фигура выглядит.",
    "Затем нужно посмотреть, как она может ходить. В этом поможет схема на доске.",
    "После этого стоит потренироваться на практике, постепенно увеличивая сложность.",
    "Первая сложность: за один ход поставить фигуру на нужное поле. Это помогает запомнить базовые ходы и заметить, что еще осталось непонятным.",
    "Вторая сложность: за несколько ходов привести фигуру на нужное поле. Здесь уже появляется более глубокое понимание того, как фигура реально передвигается по доске.",
    "Третья сложность: за несколько ходов привести фигуру на нужное поле, но с препятствиями. Лучше использовать нейтральные маркеры или фигуры своего цвета, чтобы не привыкать к мысли, что фигуры соперника — это просто запрещенные клетки.",
    "Четвертая сложность: не просто дойти до поля, а съесть пешку соперника, которая будет ходить сразу после вас.",
    "Пятая сложность: объединить предыдущие уровни — съесть пешку и при этом учитывать поля, на которые вставать нельзя.",
  ],
  outro: [
    "Пройдя эти простые упражнения, вы наверняка запомните, как ходят основные фигуры.",
    "Ниже вы найдете описания всех фигур, их основных ходов и практические задания для закрепления.",
  ],
};

export function LessonIntro({ slug, content }: LessonIntroProps) {
  const preset = slug === "how-pieces-move" ? howPiecesMoveIntro : null;

  if (!preset) {
    return (
      <div className="mt-10 space-y-5 text-lg leading-8 text-stone-700">
        {content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      {preset.intro.map((paragraph) => (
        <p key={paragraph} className="text-lg leading-8 text-stone-700">
          {paragraph}
        </p>
      ))}

      <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Как изучать этот урок
        </p>
        <ol className="mt-5 space-y-3">
          {preset.steps.map((step, index) => (
            <li
              key={step}
              className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-start"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-base leading-7 text-stone-700">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
        <div className="space-y-4 text-lg leading-8 text-stone-700">
          {preset.outro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
