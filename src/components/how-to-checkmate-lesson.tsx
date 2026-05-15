"use client";

import { useEffect, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess-board";
import {
  getAllSquares,
  getIntermediateSquares,
  getReachableSquares,
  type BoardArrow,
  type PiecePlacement,
  type SquareStyleMap,
} from "@/lib/chess";
import { appColors, type FeedbackTone } from "@/lib/colors";
import type { Square } from "@/types/chessboard";

type Side = "1" | "8" | "a" | "h";
type DrillMode = "cut" | "check";

type DrillState = {
  mode: DrillMode;
  side: Side;
  king: Square;
  fixedRook: Square | null;
  movingRook: Square;
  answer: Square;
};

type EndgameState = {
  king: Square;
  rooks: Square[];
  turnCount: number;
  result: { type: FeedbackTone; message: string } | null;
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const sides: Side[] = ["1", "8", "a", "h"];

const sideLabels: Record<Side, string> = {
  "1": "1-я горизонталь",
  "8": "8-я горизонталь",
  a: "вертикаль a",
  h: "вертикаль h",
};

const sideHints: Record<Side, string> = {
  "1": "Гоним короля вниз, к первой горизонтали.",
  "8": "Гоним короля вверх, к восьмой горизонтали.",
  a: "Гоним короля влево, к вертикали a.",
  h: "Гоним короля вправо, к вертикали h.",
};

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function square(fileIndex: number, rankIndex: number): Square | null {
  const file = files[fileIndex];
  const rank = ranks[rankIndex];
  return file && rank ? (`${file}${rank}` as Square) : null;
}

function parts(item: Square) {
  return {
    file: item.charCodeAt(0) - 97,
    rank: Number(item[1]) - 1,
  };
}

function sameLine(a: Square, b: Square) {
  return a[0] === b[0] || a[1] === b[1];
}

function isEdge(item: Square) {
  return item[0] === "a" || item[0] === "h" || item[1] === "1" || item[1] === "8";
}

function kingMoves(item: Square): Square[] {
  const { file, rank } = parts(item);

  return [-1, 0, 1].flatMap((fileDelta) =>
    [-1, 0, 1].map((rankDelta) => {
      if (fileDelta === 0 && rankDelta === 0) {
        return null;
      }

      return square(file + fileDelta, rank + rankDelta);
    }),
  ).filter((candidate): candidate is Square => candidate !== null);
}

function isHorizontalSide(side: Side) {
  return side === "1" || side === "8";
}

function lineSquares(side: Side, line: string): Square[] {
  if (isHorizontalSide(side)) {
    return files.map((file) => `${file}${line}` as Square);
  }

  return ranks.map((rank) => `${line}${rank}` as Square);
}

function getCutLine(side: Side, king: Square): string | null {
  const { file, rank } = parts(king);

  if (side === "1") {
    return rank < 7 ? String(rank + 2) : null;
  }

  if (side === "8") {
    return rank > 0 ? String(rank) : null;
  }

  if (side === "a") {
    return file < 7 ? files[file + 1] : null;
  }

  return file > 0 ? files[file - 1] : null;
}

function getKingLine(side: Side, king: Square): string {
  return isHorizontalSide(side) ? king[1] : king[0];
}

function findRookSource(target: Square, occupied: Square[], forbiddenLine: string, side: Side): Square | null {
  const blocked = new Set(occupied);
  const candidates = getReachableSquares("R", target)
    .filter((candidate) => !blocked.has(candidate))
    .filter((candidate) => {
      const line = isHorizontalSide(side) ? candidate[1] : candidate[0];
      return line !== forbiddenLine;
    })
    .filter((candidate) => getIntermediateSquares(candidate, target).every((item) => !blocked.has(item)));

  return candidates.length > 0 ? randomItem(candidates) : null;
}

function makeCutDrill(): DrillState {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const side = randomItem(sides);
    const king = randomItem(getAllSquares().filter((item) => !isEdge(item)));
    const cutLine = getCutLine(side, king);

    if (!cutLine) {
      continue;
    }

    const unsafe = new Set([king, ...kingMoves(king)]);
    const answers = lineSquares(side, cutLine).filter((item) => !unsafe.has(item));
    const answer = randomItem(answers);
    const movingRook = findRookSource(answer, [king], cutLine, side);

    if (movingRook) {
      return { mode: "cut", side, king, fixedRook: null, movingRook, answer };
    }
  }

  return { mode: "cut", side: "1", king: "e5", fixedRook: null, movingRook: "a1", answer: "g6" };
}

function makeCheckDrill(): DrillState {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const side = randomItem(sides);
    const king = randomItem(getAllSquares().filter((item) => !isEdge(item)));
    const cutLine = getCutLine(side, king);

    if (!cutLine) {
      continue;
    }

    const unsafe = new Set([king, ...kingMoves(king)]);
    const cutRook = randomItem(lineSquares(side, cutLine).filter((item) => !unsafe.has(item)));
    const attackLine = getKingLine(side, king);
    const answers = lineSquares(side, attackLine).filter(
      (item) => item !== king && item !== cutRook && !unsafe.has(item) && !sameLine(item, cutRook),
    );
    if (answers.length === 0) {
      continue;
    }

    const answer = randomItem(answers);
    const movingRook = findRookSource(answer, [king, cutRook], attackLine, side);

    if (movingRook && !sameLine(movingRook, cutRook)) {
      return { mode: "check", side, king, fixedRook: cutRook, movingRook, answer };
    }
  }

  return { mode: "check", side: "1", king: "e5", fixedRook: "g6", movingRook: "h8", answer: "h5" };
}

function makeDrill(mode: DrillMode) {
  return mode === "cut" ? makeCutDrill() : makeCheckDrill();
}

function getLineStyles(side: Side, line: string, tone: "target" | "cut" | "attack"): SquareStyleMap {
  const styles: SquareStyleMap = {};
  const backgroundColor =
    tone === "target"
      ? "rgba(5, 150, 105, 0.26)"
      : tone === "cut"
        ? "rgba(37, 99, 235, 0.24)"
        : "rgba(217, 119, 6, 0.24)";

  for (const item of lineSquares(side, line)) {
    styles[item] =
      tone === "target"
        ? {
            backgroundColor,
            boxShadow: "inset 0 0 0 3px rgba(5, 150, 105, 0.7)",
          }
        : { backgroundColor };
  }

  return styles;
}

function BoardFigure({
  title,
  description,
  pieces,
  boardId,
  arrows = [],
  styles = {},
}: {
  title: string;
  description: string;
  pieces: PiecePlacement[];
  boardId: string;
  arrows?: BoardArrow[];
  styles?: SquareStyleMap;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-stone-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <ChessBoard pieces={pieces} boardId={boardId} arrows={arrows} customSquareStyles={styles} />
    </div>
  );
}

function SideCarousel() {
  const [side, setSide] = useState<Side>("1");
  const king = "e5" as Square;
  const cutLine = getCutLine(side, king) ?? "6";
  const rook = side === "1" ? "g6" : side === "8" ? "b4" : side === "a" ? "f3" : "d3";

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Шаг 2</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Отрезаем короля</h2>
        <p className="mt-3 text-base leading-7 text-stone-700">
          На этом шаге мы закрываем королю возможность уйти дальше от выбранной стороны. Для
          этого ставим ладью на один шаг дальше от выбранной стороны, чем стоит король. В
          результате король может либо остаться на том же удалении от края, либо подойти ближе к
          краю.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <ChessBoard
          pieces={[`k${king}`, `R${rook}`]}
          boardId="two-rooks-cut-carousel"
          customSquareStyles={{
            ...getLineStyles(side, side === "1" || side === "8" ? side : side, "target"),
            ...getLineStyles(side, cutLine, "cut"),
          }}
        />
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <p>{sideHints[side]}</p>
          <p>
            Ладья встает на линию перед королем и закрывает ему дорогу обратно в центр. После
            этого у короля остаются ходы только к выбранному краю или вдоль своей линии.
          </p>
          <div className="flex flex-wrap gap-2">
            {sides.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSide(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  item === side
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {sideLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RookDrill() {
  const timerRef = useRef<number | null>(null);
  const [mode, setMode] = useState<DrillMode>("cut");
  const [drill, setDrill] = useState<DrillState>(() => makeDrill("cut"));
  const [overlay, setOverlay] = useState<{ type: FeedbackTone; message: string } | null>(null);
  const pieces = [`k${drill.king}`, `R${drill.movingRook}`, ...(drill.fixedRook ? [`R${drill.fixedRook}`] : [])];

  function next(nextMode = mode) {
    setMode(nextMode);
    setDrill(makeDrill(nextMode));
    setOverlay(null);
  }

  function scheduleNext(delay = 2000) {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => next(), delay);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <section className="space-y-5 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Практика</p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          {mode === "cut" ? "Поставьте ладью так, чтобы отрезать короля" : "Найдите правильный шах"}
        </h2>
        <p className="text-base leading-7 text-stone-700">Перетащите ладью на правильное поле.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => next("cut")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "cut" ? "bg-emerald-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"
            }`}
          >
            Отрезать
          </button>
          <button
            type="button"
            onClick={() => next("check")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "check" ? "bg-emerald-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"
            }`}
          >
            Дать шах
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
        <ChessBoard
          pieces={pieces}
          boardId={`two-rooks-drill-${mode}-${drill.king}-${drill.movingRook}`}
          draggable
          customSquareStyles={getLineStyles(drill.side, drill.side, "target")}
          overlay={overlay}
          onPieceDrop={(source, target) => {
            if (source !== drill.movingRook) {
              setOverlay({ type: "error", message: "Эта ладья отрезает. Нападате другой ладьей." });
              return false;
            }

            if (target !== drill.answer) {
              setOverlay({ type: "error", message: "Почти. Попробуйте еще раз." });
              scheduleNext();
              return false;
            }

            setDrill((current) => ({ ...current, movingRook: target }));
            setOverlay({ type: "success", message: "Верно." });
            scheduleNext();
            return true;
          }}
        />
        <div className="space-y-4 text-base leading-7 text-stone-700">
          <p className="rounded-[1rem] bg-white p-4 font-semibold text-stone-900 ring-1 ring-stone-200">
            Цель: {sideLabels[drill.side]}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDrill((current) => ({ ...current, movingRook: current.answer }));
                setOverlay({ type: "info", message: `Ответ: ${drill.answer}` });
              }}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100"
            >
              Ответ
            </button>
            <button
              type="button"
              onClick={() => next()}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Следующая задача
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function rookAttacksSquare(rook: Square, target: Square, blockers: Square[]) {
  if (!sameLine(rook, target)) {
    return false;
  }

  return getIntermediateSquares(rook, target).every((item) => !blockers.includes(item));
}

function isKingInCheck(king: Square, rooks: Square[]) {
  return rooks.some((rook) => rookAttacksSquare(rook, king, rooks.filter((item) => item !== rook)));
}

function blackKingMoves(king: Square, rooks: Square[]): Square[] {
  return kingMoves(king).filter((target) => {
    const remainingRooks = rooks.filter((rook) => rook !== target);
    return !remainingRooks.some((rook) => rookAttacksSquare(rook, target, remainingRooks.filter((item) => item !== rook)));
  });
}

function isMate(king: Square, rooks: Square[]) {
  return isKingInCheck(king, rooks) && blackKingMoves(king, rooks).length === 0;
}

function isStalemate(king: Square, rooks: Square[]) {
  return !isKingInCheck(king, rooks) && blackKingMoves(king, rooks).length === 0;
}

function makeEndgame(): EndgameState {
  const king = randomItem(getAllSquares().filter((item) => !isEdge(item)));
  const unsafe = new Set([king, ...kingMoves(king)]);
  const rookSquares = getAllSquares().filter((item) => !unsafe.has(item) && !sameLine(item, king));
  const first = randomItem(rookSquares);
  const second = randomItem(rookSquares.filter((item) => item !== first && !sameLine(item, first)));

  return {
    king,
    rooks: [first, second],
    turnCount: 0,
    result: null,
  };
}

function EndgamePractice() {
  const [state, setState] = useState<EndgameState>(() => makeEndgame());

  function reset() {
    setState(makeEndgame());
  }

  function getLegalRookTargets(source: Square, king: Square, rooks: Square[]) {
    const movingRookIndex = rooks.indexOf(source);

    if (movingRookIndex < 0) {
      return [];
    }

    const blockers = [king, ...rooks.filter((_, index) => index !== movingRookIndex)];

    return getReachableSquares("R", source).filter((target) => {
      if (blockers.includes(target)) {
        return false;
      }

      if (!getIntermediateSquares(source, target).every((item) => !blockers.includes(item))) {
        return false;
      }

      return true;
    });
  }

  function moveBlackKing(king: Square, rooks: Square[]) {
    const moves = blackKingMoves(king, rooks);
    const capture = moves.find((target) => rooks.includes(target));

    if (capture) {
      return {
        king: capture,
        rooks: rooks.filter((rook) => rook !== capture),
        message: "Король съел ладью. Это проигрыш: ладью нельзя оставлять под боем.",
      };
    }

    return { king: moves.length > 0 ? randomItem(moves) : king, rooks, message: null };
  }

  function handleRookDrop(source: Square, target: Square) {
    if (state.result || !state.rooks.includes(source)) {
      return false;
    }

    const movingRookIndex = state.rooks.indexOf(source);
    const legalTargets = getLegalRookTargets(source, state.king, state.rooks);

    if (!legalTargets.includes(target)) {
      return false;
    }

    const nextRooks = [...state.rooks];
    nextRooks[movingRookIndex] = target;

    if (isMate(state.king, nextRooks)) {
      setState((current) => ({
        ...current,
        rooks: nextRooks,
        result: { type: "success", message: "Мат. Отлично!" },
      }));
      return true;
    }

    if (isStalemate(state.king, nextRooks)) {
      setState((current) => ({
        ...current,
        rooks: nextRooks,
        result: {
          type: "error",
          message: "Неудача, это пат - то есть партия закончилась в ничью. Попробуйте еще раз.",
        },
      }));
      return true;
    }

    const reply = moveBlackKing(state.king, nextRooks);

    if (reply.message || reply.rooks.length < 2) {
      setState((current) => ({
        ...current,
        king: reply.king,
        rooks: reply.rooks,
        result: { type: "error", message: reply.message ?? "Одна ладья потеряна." },
      }));
      return true;
    }

    const nextTurnCount = state.turnCount + 1;
    setState((current) => ({
      ...current,
      king: reply.king,
      rooks: reply.rooks,
      turnCount: nextTurnCount,
      result:
        nextTurnCount >= 30
          ? {
              type: "info",
              message: "Уже 30 ходов без мата. Стоит еще раз пройти правило двух ладей.",
            }
          : null,
    }));

    return true;
  }

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Финальная практика</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Поставьте мат двумя ладьями</h2>
        <p className="mt-3 text-base leading-7 text-stone-700">
          Примените все ваши знания, чтобы поставить мат двумя ладьями.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
        <ChessBoard
          pieces={[`k${state.king}`, ...state.rooks.map((rook) => `R${rook}`)]}
          boardId={`two-rooks-endgame-${state.king}-${state.rooks.join("-")}`}
          draggable={!state.result}
          overlay={state.result}
          onPieceDrop={handleRookDrop}
        />
        <div className="space-y-4 rounded-[1rem] bg-stone-50 p-4 ring-1 ring-stone-200">
          <p className="text-sm font-medium text-stone-600">Ходов: {state.turnCount}</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Новая позиция
          </button>
        </div>
      </div>
    </section>
  );
}

export function HowToCheckmateLesson() {
  return (
    <div className="mt-8 space-y-8 sm:mt-10">
      <section className="space-y-8 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 sm:p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Мат двумя ладьями</h2>
          <p className="text-base leading-7 text-stone-700">
            Его часто называют линейным матом, потому что ладьи работают по линиям.
            Особенность ладьи - что каждая ладья атакует или блокирует всю линию целиком.
            А если поставить 2 ладьи на соседние линии, то у короля останется только 1 нарпавление куда идти.
            Так что чтобы поставить мат - одна ладья отрезает королю путь к побегу, а вторая дает шах и заставляет короля идти к краю доски, или ставит мат.

          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
        <BoardFigure
          title="Ладья контролирует две линии"
          description="Она ходит и атакует по горизонтали и вертикали."
          pieces={["Rd4"]}
          boardId="two-rooks-rook-lines"
          arrows={[
            { from: "d4", to: "d8", color: appColors.arrow.primary },
            { from: "d4", to: "d1", color: appColors.arrow.primary },
            { from: "d4", to: "a4", color: appColors.arrow.primary },
            { from: "d4", to: "h4", color: appColors.arrow.primary },
          ]}
        />
        <BoardFigure
          title="Матовая картинка"
          description="Король у края, одна ладья дает шах, вторая закрывает вторую линию."
          pieces={["kb1", "Rh1", "Rg2"]}
          boardId="two-rooks-mate-picture"
          arrows={[{ from: "h1", to: "b1", color: appColors.arrow.danger }]}
          styles={getLineStyles("1", "2", "cut")}
        />
        </div>

        <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Шаг 1</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Выберите сторону доски
          </h2>
          <p className="mt-3 text-base leading-7 text-stone-700">
            Самая частая ошибка новичков: они вроде гонят короля к краю, но каждый ход меняют
            направление. Поэтому первый шаг простой: выберите сторону доски и больше ее не меняйте.
            Тут можно выбрать любую сторону. Нет какой-то правильной или не правильной стороны. Мат может быть поставлен у любой из сторон. Вам могут говорить, что правильно выбирать ближайшую сторону, но на самом деле - это не очень важно, так как разница в скорости поставления мата не сильно отличается если вы выбирете ближающую или самую дальнюю сторону. Главное ее не менять.
          </p>
        </div>
        </section>

      <SideCarousel />

      <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Шаг 3</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Нападаем по параллельной линии
          </h2>
          <p className="mt-3 text-base leading-7 text-stone-700">
            Когда вы отрезали короля, дальше надо напасть на него, забирая у него еще одну
            линию. При этом атаки должны идти по линиям, параллельным тем линиям, по которым мы
            отрезаем короля.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <BoardFigure
            title="Правильно"
            description="Одна ладья отрезает 6-ю горизонталь, вторая дает шах по 5-й."
            pieces={["ke5", "Rg6", "Rh5"]}
            boardId="two-rooks-right-check"
            arrows={[{ from: "h5", to: "e5", color: appColors.arrow.danger }]}
            styles={{ ...getLineStyles("1", "6", "cut"), ...getLineStyles("1", "5", "attack") }}
          />
          <BoardFigure
            title="Неправильно"
            description="Ладья не дает шах по нужной линии, и король не обязан идти к выбранному краю."
            pieces={["ke5", "Rg6", "Re8"]}
            boardId="two-rooks-wrong-check"
            arrows={[{ from: "e8", to: "e5", color: appColors.arrow.dangerSoft }]}
            styles={getLineStyles("1", "6", "cut")}
          />
        </div>
      </section>

      <RookDrill />

      <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Шаг 4</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Повторяем до мата
          </h2>
          <p className="mt-3 text-base leading-7 text-stone-700">
            После того как вы дали шах и король отошел, роли ладей поменялись. Та ладья, которая
            давала шах, теперь отрезает отход, а та, что раньше отрезала, должна давать шах.
            Продолжайте отрезать короля, и когда вы дойдете до последней линии, это будет мат.
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold tracking-tight text-stone-950">Берегите ладьи</h3>
          <p className="text-base leading-7 text-stone-700">
            Король не будет просто ждать мата. Если ладья окажется рядом, он попробует ее съесть.
            Когда король напал на ладью, отойдите по той же линии как можно дальше, но не ставьте
            обе ладьи на одну линию.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <BoardFigure
            title="Сначала отойти"
            description="В позиции Ke4, Rd5, Rh6 шах ладьей h6 опасен: король близко к ладье d5."
            pieces={["ke4", "Rd5", "Rh6"]}
            boardId="two-rooks-rook-attacked-one"
            styles={{ d5: appColors.board.forbiddenSquare }}
          />
          <BoardFigure
            title="Не ставить под бой"
            description="Если ладья пойдет с d6 на d4, король сможет ее съесть. Сначала отведите ее дальше."
            pieces={["ke4", "Rh5", "Rd6"]}
            boardId="two-rooks-rook-attacked-two"
            arrows={[{ from: "d6", to: "d4", color: appColors.arrow.dangerSoft }]}
            styles={{ d4: appColors.board.forbiddenSquare }}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-stone-50 p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Коротко, как поставить мат 2 ладьями</h2>
        <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-stone-700">
          <li>Выберите край доски, куда будете гнать короля.</li>
          <li>Одна ладья отрезает, вторая атакует.</li>
          <li>После шаха роли ладей меняются.</li>
          <li>Если король напал на ладью, отойдите по линии и не мешайте второй ладье.</li>
        </ul>
      </section>

      <EndgamePractice />
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Дальше</h2>
        <p className="text-base leading-7 text-stone-700">
          В этом уроке мы начали с мата двумя ладьями. Следующие части раздела будут про мат
          ферзем и королем, а затем про мат одной ладьей и королем.
        </p>
      </section>
    </div>
  );
}
