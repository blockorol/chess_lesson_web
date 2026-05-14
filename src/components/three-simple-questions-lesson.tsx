const questions = [
  {
    title: "1. Мне что-то угрожает?",
    text: "Когда соперник сделал ход, спросите себя: у меня что-то могут съесть? Мне грозит мат в 1 ход? Если да, сначала спасайтесь от этого.",
  },
  {
    title: "2. Я могу что-то съесть?",
    text: "Если прямой угрозы нет, спросите себя: а я могу что-то съесть? Если можете выгодно съесть фигуру соперника - ешьте.",
  },
  {
    title: "3. Мой ход безопасен?",
    text: "Когда вы выбрали ход, даже если едите фигуру, перед самым ходом спросите: я ставлю фигуру безопасно? Ее могут там съесть? Если могут, выгодно ли мне это?",
  },
];

const pieceValues = [
  ["Пешка", "1"],
  ["Слон", "3"],
  ["Конь", "3"],
  ["Ладья", "5"],
  ["Ферзь", "10"],
  ["Король", "бесценно"],
];

export function ThreeSimpleQuestionsLesson() {
  return (
    <div className="mt-8 space-y-8 sm:mt-10">
      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 sm:p-6">
        <p className="text-base leading-7 text-stone-700">
          Это будет, пожалуй, самый короткий урок. Как в &quot;Гарри Поттере&quot; для
          аппарации надо было следовать правилу трех &quot;н&quot;, в шахматах тоже есть
          похожий подход.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Делая ход, задайте себе три простых вопроса. Этого уже хватит, чтобы
          играть намного увереннее и реже отдавать фигуры просто так.
        </p>
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Три вопроса</h2>
        <div className="grid gap-4">
          {questions.map((question) => (
            <article key={question.title} className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
              <h3 className="text-xl font-semibold tracking-tight text-stone-950">{question.title}</h3>
              <p className="mt-3 text-base leading-7 text-stone-700">{question.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Как считать выгодно или нет</h2>
        <p className="text-base leading-7 text-stone-700">
          Для простоты подсчета используйте такую цену фигур:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {pieceValues.map(([piece, value]) => (
            <div key={piece} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
              <span className="font-medium text-stone-800">{piece}</span>
              <span className="text-stone-600">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-base leading-7 text-stone-700">
          Король бесценен. Есть вещи, которые нельзя купить.
        </p>
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Все. Вы великолепны.</h2>
        <p className="text-base leading-7 text-stone-700">
          Скорее всего, этих трех вопросов хватит на очень долго. Причем не
          обязательно смотреть на много ходов вперед. Речь именно про &quot;сейчас&quot;:
          могут ли вас съесть? Можете ли вы съесть? Там, куда вы хотите пойти,
          вашу фигуру могут съесть?
        </p>
        <p className="text-base leading-7 text-stone-700">
          Кажется, что это просто, но на практике довольно сложно не забывать
          задавать себе эти вопросы и каждый ход проверять через них.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Попробуйте поиграть с этой настройкой. Не старайтесь сразу выиграть и
          поставить мат. Просто следуйте трем правилам и потихоньку ешьте фигуры
          соперника. А как привести это к победе, мы разберем в следующих уроках.
        </p>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Упражнение</p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          Сыграйте партию только по трем вопросам
        </h2>
        <p className="text-base leading-7 text-stone-700">
          Попробуйте поиграть с другом или компьютером, каждый ход проверяя себя:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-stone-700">
          <li>Могут ли вас съесть?</li>
          <li>Можете ли вы съесть?</li>
          <li>Там, куда хотите пойти, вашу фигуру могут съесть?</li>
        </ul>
        <p className="text-base leading-7 text-stone-700">
          Не старайтесь поставить мат. Играйте до перевеса в 10 очков или
          выберите количество ходов, например 25, и просто посмотрите, что выйдет.
        </p>
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-base leading-7 text-amber-950">
          <p className="font-semibold">Небольшое предостережение</p>
          <p className="mt-2">
            Хоть это и выглядит очень простым, такая игра требует довольно сильной работы мозга.
            А мозг потребляет много сахара. Если почувствуете слабость или головокружение,
            сделайте паузу и съешьте что-то сладкое: возможно, у вас просто закончился сахар. Да,
            такое правда может случаться, и это не шутка.
          </p>
          <p className="mt-2">
            Кстати, на турниры мы всегда ходили с шоколадом и сладким чаем, потому что даже после
            часа игры сахар уже заметно сгорает.
          </p>
        </div>
      </section>
    </div>
  );
}
