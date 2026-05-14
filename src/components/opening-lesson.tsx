import { ChessBoard } from "@/components/chess-board";
import { appColors } from "@/lib/colors";
import { placementsToPosition, positionToPlacements, type BoardArrow } from "@/lib/chess";
import type { BoardPosition } from "@/types/chessboard";

const initialPosition = placementsToPosition([
  "Ra1",
  "Nb1",
  "Bc1",
  "Qd1",
  "Ke1",
  "Bf1",
  "Ng1",
  "Rh1",
  "Pa2",
  "Pb2",
  "Pc2",
  "Pd2",
  "Pe2",
  "Pf2",
  "Pg2",
  "Ph2",
  "ra8",
  "nb8",
  "bc8",
  "qd8",
  "ke8",
  "bf8",
  "ng8",
  "rh8",
  "pa7",
  "pb7",
  "pc7",
  "pd7",
  "pe7",
  "pf7",
  "pg7",
  "ph7",
]);

const undevelopedKnightBoard = initialPosition;
const undevelopedKnightArrows: BoardArrow[] = [
  { from: "b1", to: "a3", color: appColors.arrow.primary },
  { from: "b1", to: "c3", color: appColors.arrow.primary },
];

const developedKnightBoard: BoardPosition = (() => {
  const board: BoardPosition = {
    ...initialPosition,
    c3: "wN",
    e4: "wP",
    e5: "bP",
  };

  delete board.b1;
  delete board.e2;
  delete board.e7;

  return board;
})();

const developedKnightArrows: BoardArrow[] = [
  { from: "c3", to: "a2", color: appColors.arrow.success },
  { from: "c3", to: "a4", color: appColors.arrow.success },
  { from: "c3", to: "b1", color: appColors.arrow.success },
  { from: "c3", to: "b5", color: appColors.arrow.success },
  { from: "c3", to: "d1", color: appColors.arrow.success },
  { from: "c3", to: "d5", color: appColors.arrow.success },
  { from: "c3", to: "e2", color: appColors.arrow.success },
  { from: "c3", to: "e4", color: appColors.arrow.success },
];

function LessonBoard({
  arrows = [],
  board,
  boardId,
  label,
}: {
  arrows?: BoardArrow[];
  board: BoardPosition;
  boardId: string;
  label: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-stone-700">{label}</p>
      <ChessBoard pieces={positionToPlacements(board)} arrows={arrows} boardId={boardId} />
    </div>
  );
}

export function OpeningLesson() {
  return (
    <div className="mt-8 space-y-8 sm:mt-10">
      <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 sm:p-6">
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <p>В начале наша позиция выглядит вот так:</p>
          <div className="max-w-[320px]">
            <LessonBoard board={initialPosition} boardId="opening-initial-position" label="Начальная позиция" />
          </div>
          <p>
            Количество возможных ходов поражает! На каждом ходу есть десятки вариантов, как пойти,
            и уже к 10 ходу количество возможных позиций становится нереально большим.
          </p>
          <p>
            Так что я не советую вам учить правильные ходы для начала партии. Лучше разобраться в
            том, что собственно надо сделать. Конечно, есть заготовленные правильные ходы, которые
            называют дебютами. Но таких дебютов десятки и сотни. Это сильно меньше, чем возможных
            позиций, но все еще: если начать учить, уйдет очень много времени и не очень много
            удовольствия.
          </p>
          <p>
            Да, дебюты полезны и эффективны, если вы играете профессионально. Но для любительской
            игры, и особенно для начала игры, попытка сразу учить дебюты часто только отпугивает.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Так что же тогда делать?</h2>
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <p>
            Давайте просто разберемся, что важно делать в начале игры. В целом все тут описывается
            одной фразой: надо развиваться. А точнее, надо развивать свои фигуры. Пешки к фигурам
            не относятся.
          </p>
          <p>
            Развитие фигур - это ставить их так, чтобы у них было как можно больше возможных ходов.
            Вот смотрите: конь в начале игры и развитый конь.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <LessonBoard
            board={undevelopedKnightBoard}
            boardId="opening-undeveloped-knight"
            arrows={undevelopedKnightArrows}
            label="Конь в начале игры"
          />
          <LessonBoard
            board={developedKnightBoard}
            boardId="opening-developed-knight"
            arrows={developedKnightArrows}
            label="Развитый конь"
          />
        </div>
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <p>
            Как вы видите, у начального положения коня только 2 поля, а у развитого - сразу 8.
            Кстати, это помогает с вопросом: куда мне ставить фигуру?
          </p>
          <p>
            Выбирая для коня поле ближе к центру или на краю доски, следуйте заветам коренных
            москвичей и выбирайте центр. Оттуда больше ходов, чем с края доски.
          </p>
          <p>
            Единственная фигура, которую мы не будем выводить, - это король. Его в начале игры мы,
            наоборот, будем прятать.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Зачем нужны дебюты</h2>
        <p className="text-base leading-7 text-stone-700">
          В целом любой дебют, который вы найдете, так или иначе ставит своей целью развитие фигур.
          Да, у дебютов кроме этого есть стратегия и понимание, что эти фигуры будут делать дальше:
          в середине игры, которая называется миттельшпилем, а иногда даже в конце игры - эндшпиле.
          Но на начальном уровне это все не важно.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Первая задача - научиться выводить все свои фигуры: слонов, коней, ладей, ферзя. Все они
          должны участвовать в игре. Если вы этого не делаете, вы как будто даете противнику фору:
          по сути вы играете меньшим количеством фигур.
        </p>
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Мини-игра для тренировки</h2>
        <p className="text-base leading-7 text-stone-700">
          Чтобы научиться быстро выводить фигуры, я советую потренироваться с другом-новичком в
          специальную игру: побеждает тот, кто первый выведет все свои фигуры. В момент окончания
          развития вы сразу останавливаете игру.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Если вам не с кем это тренировать, можно делать это и с компьютером на простом уровне
          сложности: выводите фигуры, стараясь сделать это быстрее соперника.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Когда пройдете этот уровень, есть более сложный вариант: учитывайте только те фигуры,
          которые остались на доске. Фигуры могут съесть, или вы можете съесть фигуры соперника.
          Игра заканчивается, когда один из игроков выведет все фигуры. Но он не становится сразу
          победителем: вы подсчитываете количество развитых фигур, которые остались на доске. У кого
          их больше, тот и победил.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Теперь вам придется не только следить, чтобы все фигуры вышли, но и смотреть, чтобы их не
          съели. Удивительным образом, играя по этим простым правилам, вы будете получать как раз те
          самые дебюты, которые можно найти в книгах и базах партий.
        </p>
        <p className="text-base leading-7 text-stone-700">
          Есть небольшое исключение: в дебютах бывают ловушки и планы на середину игры. В какой-то
          момент станет важно их знать и понимать. Но для начала, если вы будете выводить фигуры и
          ставить их безопасно, вы станете очень сильны в дебюте.
        </p>
      </section>
    </div>
  );
}
