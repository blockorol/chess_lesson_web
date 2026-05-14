"use client";

import { useState } from "react";
import { ChessBoard } from "@/components/chess-board";
import { placementsToPosition, positionToPlacements } from "@/lib/chess";
import type { BoardPosition } from "@/types/chessboard";

const midgameAdvantagePosition = placementsToPosition([
  "Ra1",
  "Bc1",
  "Qe2",
  "Ke1",
  "Bf1",
  "Ng1",
  "Rh1",
  "Pa2",
  "Pb2",
  "Pc4",
  "Pd4",
  "Pe5",
  "Pf2",
  "Pg2",
  "Ph2",
  "ra8",
  "bc8",
  "qd8",
  "ke8",
  "bf8",
  "rh8",
  "pa7",
  "pc6",
  "pd6",
  "pf7",
  "pg7",
  "ph7",
]);

const endgameAdvantagePosition = placementsToPosition([
  "Ke4",
  "Nd4",
  "Pf3",
  "Pg3",
  "Ph4",
  "ke6",
  "pf6",
  "pg6",
  "ph5",
]);

const knightOnlyDrawPosition = placementsToPosition(["Ke4", "Nd4", "ke6"]);
const knightWithPawnWinPosition = placementsToPosition(["Ke4", "Nd4", "Pe5", "ke6", "pe7"]);

const worldChampionExamples = [
  {
    title: "Bobby Fischer - Boris Spassky",
    subtitle: "Матч на первенство мира 1972, 6-я партия",
    boardId: "material-fischer-spassky",
    position: placementsToPosition([
      "Ra1",
      "Re1",
      "Kg1",
      "Qd2",
      "Bd3",
      "Nc3",
      "Nf3",
      "Pa2",
      "Pb2",
      "Pc4",
      "Pd4",
      "Pe3",
      "Pf2",
      "Pg2",
      "Ph2",
      "ra8",
      "rf8",
      "kg8",
      "nc6",
      "nf6",
      "pa7",
      "pb6",
      "pc5",
      "pd5",
      "pf7",
      "pg7",
      "ph7",
    ]),
    caption:
      "После 29. Qd2! Фишер давит на пешку c5 и постепенно выигрывает ее. Это не матовая атака и не комбинация, а учебный пример: одна слабая пешка может стать темой всей партии.",
  },
  {
    title: "Bobby Fischer - Tigran Petrosian",
    subtitle: "Матч претендентов 1971, 7-я партия",
    boardId: "material-fischer-petrosian",
    position: placementsToPosition([
      "Ra1",
      "Re1",
      "Kg1",
      "Qc2",
      "Nc3",
      "Nf3",
      "Pa2",
      "Pb2",
      "Pb4",
      "Pc4",
      "Pd4",
      "Pe3",
      "Pf2",
      "Pg2",
      "Ph2",
      "ra8",
      "qd8",
      "rf8",
      "kg8",
      "nc6",
      "nf6",
      "pa7",
      "pb6",
      "pc5",
      "pd5",
      "pf7",
      "pg7",
      "ph7",
    ]),
    caption:
      "Фишер выигрывает пешку на ферзевом фланге, но не спешит все менять. Идея современная: выиграть пешку, сохранить инициативу и заставить соперника защищаться.",
  },
  {
    title: "Magnus Carlsen - Viswanathan Anand",
    subtitle: "Матч на первенство мира 2013, 5-я партия",
    boardId: "material-carlsen-anand",
    position: placementsToPosition([
      "Ra1",
      "Re1",
      "Kg1",
      "Qc2",
      "Nc3",
      "Nf3",
      "Pa2",
      "Pb2",
      "Pc4",
      "Pd4",
      "Pe3",
      "Pf2",
      "Pg2",
      "Ph2",
      "ra8",
      "qd8",
      "rf8",
      "kg8",
      "nc6",
      "nf6",
      "pa7",
      "pb7",
      "pc5",
      "pd5",
      "pf7",
      "pg7",
      "ph7",
    ]),
    caption:
      "Карлсен выигрывает пешку и еще долго не меняет ферзей. Это типичная карлсеновская реализация: маленький плюс, давление, улучшение фигур и только потом упрощение.",
  },
];

function LessonBoard({
  board,
  boardId,
  label,
}: {
  board: BoardPosition;
  boardId: string;
  label: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-stone-700">{label}</p>
      <ChessBoard pieces={positionToPlacements(board)} boardId={boardId} />
    </div>
  );
}

function ChampionExampleCarousel() {
  const [index, setIndex] = useState(0);
  const example = worldChampionExamples[index];

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Примеры чемпионов мира
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          Когда одной пешки хватает для победы
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
        <LessonBoard board={example.position} boardId={example.boardId} label={`${index + 1} из ${worldChampionExamples.length}`} />
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-stone-950">{example.title}</h3>
            <p className="mt-1 text-sm font-medium text-stone-500">{example.subtitle}</p>
          </div>
          <p>{example.caption}</p>
          <div className="flex flex-wrap gap-2">
            {worldChampionExamples.map((item, itemIndex) => (
              <button
                key={item.boardId}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  itemIndex === index
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Пример {itemIndex + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MaterialAdvantageLesson() {
  return (
    <div className="mt-8 space-y-8 sm:mt-10">
      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 sm:p-6">
        <p className="text-base leading-7 text-stone-700">
          В прошлых уроках мы научились ходить так, чтобы все пришло к тому, что у нас есть
          небольшой или большой перевес. Но это еще не победа.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Да, до этого я просил не ставить себе целью выиграть и поставить мат. В этом уроке мы
          приблизимся еще на один шаг к тому, чтобы довести перевес до победы.
        </p>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Когда пора меняться</h2>
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <p>
            Как только вы получили значительный для вас перевес, можно начинать охоту на фигуры
            соперника: обменивайтесь всегда, когда это возможно, если обмен равный.
          </p>
          <p>
            Изначально в игре 8 пешек, 2 коня, 2 слона, 2 ладьи, ферзь и король. Если считать
            примерно, получаем: 8 + 2 * 3 + 2 * 3 + 2 * 5 + 10 = 40 баллов.
          </p>
          <p>
            Если вы выиграли, например, ферзя, то у вас 40 баллов против 30. Это перевес примерно
            на 30%. Но если после этого вы разменяете ладьи, общая сила станет 30 против 20, и
            перевес станет уже 50%.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <LessonBoard
            board={midgameAdvantagePosition}
            boardId="material-midgame-advantage"
            label="В начале перевес есть, но на доске еще много фигур"
          />
          <LessonBoard
            board={endgameAdvantagePosition}
            boardId="material-endgame-advantage"
            label="После обменов лишняя фигура ощущается намного сильнее"
          />
        </div>
        <p className="text-base leading-7 text-stone-700">
          Вы не выиграли новых фигур, но почувствовали, что ваш перевес стал больше. Чем меньше
          фигур на доске, тем заметнее каждая лишняя фигура.
        </p>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">К чему стремиться</h2>
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <p>
            В идеале довести игру до состояния, где у вас осталась лишняя сильная фигура, а у
            соперника ее нет. Особенно хорошо, если это ферзь или ладья.
          </p>
          <p>
            В следующем уроке мы разберем, как легко поставить мат, если у вас остался ферзь или
            ладья против короля.
          </p>
          <p>
            Если такого большого перевеса нет, обязательно оставьте пешки. В конце игры их будет
            проще довести до последнего поля и превратить в ферзя или другую сильную фигуру.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <LessonBoard board={knightOnlyDrawPosition} boardId="material-knight-draw" label="Конь без пешек: ничья" />
          <LessonBoard
            board={knightWithPawnWinPosition}
            boardId="material-knight-pawn-win"
            label="Конь и пешка против пешки: победа, если играть правильно"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Какой перевес считать значительным?</h2>
        <p className="text-base leading-7 text-stone-700">
          Тут я вам не подскажу универсальное число: это у каждого свое. Кому-то мало и ферзя, а
          гроссмейстер считает, что победил, если получил лишнюю пешку.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Вот несколько примеров, где выигрыш пешки стал достаточным для победы: не за счет мата и
          не за счет хитрой комбинации, а за счет обменов и реализации преимущества.
        </p>
      </section>

      <ChampionExampleCarousel />

      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Итог</h2>
        <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-stone-700">
          <li>Если у вас появился перевес - начинайте обменивать фигуры.</li>
          <li>Дальше проводите ферзя, если его нет, и ставьте мат.</li>
          <li>Чем меньше фигур, тем более заметным становится перевес.</li>
          <li>Вам надо найти свой баланс: когда перевес становится значительным, начинайте обмены.</li>
        </ul>
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Практика</p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          Потренируйте обмены с разными задачами
        </h2>
        <p className="text-base leading-7 text-stone-700">
          Поставьте начальную или любую другую позицию. Если надоело играть с самого начала,
          найдите партии великих шахматистов, например чемпионов мира, и поставьте позицию из
          начала или середины партии. Позиция может быть нейтральной или уже с перевесом.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Задача одного игрока - разменять как можно больше фигур. Задача другого - оставить на
          доске как можно больше фигур и избегать разменов.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Тут снова не нужно играть до мата. Выберите определенное время или количество ходов и
          посмотрите, кому удалось навязать свой план.
        </p>
      </section>
    </div>
  );
}
