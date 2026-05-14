"use client";

import { useMemo, useState } from "react";
import {
  positionDatasetConfigs,
  type PositionDatasetConfig,
  type PositionDatasetId,
} from "@/lib/admin-position-datasets";
import { appColors } from "@/lib/colors";
import type { BoardPosition, Piece, Square } from "@/types/chessboard";

type AdminEntry = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  explanation?: string;
  caption?: string;
  isMate?: boolean;
  isStalemate?: boolean;
  exampleAnswer?: {
    from: Square;
    to: Square;
  };
};

type AdminDataset = PositionDatasetConfig & {
  entries: AdminEntry[];
};

const squares = ["a", "b", "c", "d", "e", "f", "g", "h"].flatMap((file) =>
  ["8", "7", "6", "5", "4", "3", "2", "1"].map((rank) => `${file}${rank}` as Square),
);

const pieceOptions: Array<{ piece: Piece | "erase"; label: string; glyph: string }> = [
  { piece: "wK", label: "Белый король", glyph: "♔" },
  { piece: "wQ", label: "Белый ферзь", glyph: "♕" },
  { piece: "wR", label: "Белая ладья", glyph: "♖" },
  { piece: "wB", label: "Белый слон", glyph: "♗" },
  { piece: "wN", label: "Белый конь", glyph: "♘" },
  { piece: "wP", label: "Белая пешка", glyph: "♙" },
  { piece: "bK", label: "Черный король", glyph: "♚" },
  { piece: "bQ", label: "Черный ферзь", glyph: "♛" },
  { piece: "bR", label: "Черная ладья", glyph: "♜" },
  { piece: "bB", label: "Черный слон", glyph: "♝" },
  { piece: "bN", label: "Черный конь", glyph: "♞" },
  { piece: "bP", label: "Черная пешка", glyph: "♟" },
  { piece: "erase", label: "Очистить поле", glyph: "×" },
];

const pieceGlyphs = pieceOptions.reduce<Record<string, string>>((items, item) => {
  items[item.piece] = item.glyph;
  return items;
}, {});

function emptyForm() {
  return {
    position: {} as BoardPosition,
    sideToMove: "white" as "white" | "black",
    explanation: "",
    answerFrom: "a1" as Square,
    answerTo: "a1" as Square,
    booleanAnswer: false,
  };
}

function getDatasetBooleanLabel(dataset: PositionDatasetConfig) {
  if (dataset.id === "mateQuiz") {
    return "Это мат";
  }

  if (dataset.id === "stalemateQuiz") {
    return "Это пат";
  }

  return "";
}

function getInitialDatasetId(value: string | null): PositionDatasetId {
  return positionDatasetConfigs.some((dataset) => dataset.id === value) ? (value as PositionDatasetId) : "mateQuiz";
}

function buildEntryPayload(dataset: PositionDatasetConfig, form: ReturnType<typeof emptyForm>) {
  const base = {
    position: form.position,
    sideToMove: form.sideToMove,
    explanation: form.explanation,
  };

  if (dataset.id === "mateInOne") {
    return {
      ...base,
      answer: {
        from: form.answerFrom,
        to: form.answerTo,
      },
    };
  }

  if (dataset.id === "drawExamples") {
    return {
      position: form.position,
      sideToMove: form.sideToMove,
      caption: form.explanation,
    };
  }

  if (dataset.id === "mateQuiz") {
    return {
      ...base,
      isMate: form.booleanAnswer,
    };
  }

  if (dataset.id === "stalemateQuiz") {
    return {
      ...base,
      isStalemate: form.booleanAnswer,
    };
  }

  return base;
}

function AdminBoard({
  position,
  selectedPiece,
  onChange,
}: {
  position: BoardPosition;
  selectedPiece: Piece | "erase";
  onChange: (position: BoardPosition) => void;
}) {
  return (
    <div className="grid aspect-square w-full max-w-[360px] grid-cols-8 overflow-hidden rounded-xl border border-stone-300 shadow-sm">
      {squares.map((square) => {
        const fileIndex = square.charCodeAt(0) - 97;
        const rank = Number(square[1]);
        const isLight = (fileIndex + rank) % 2 === 1;
        const piece = position[square];

        return (
          <button
            key={square}
            type="button"
            className="flex aspect-square items-center justify-center text-3xl leading-none"
            style={{
              backgroundColor: isLight ? appColors.board.square.light : appColors.board.square.dark,
            }}
            title={square}
            onClick={() => {
              const nextPosition = { ...position };

              if (selectedPiece === "erase") {
                delete nextPosition[square];
              } else {
                nextPosition[square] = selectedPiece;
              }

              onChange(nextPosition);
            }}
          >
            {piece ? pieceGlyphs[piece] : ""}
          </button>
        );
      })}
    </div>
  );
}

export function AdminPositionsPanel({ initialDatasetId = "mateQuiz" }: { initialDatasetId?: PositionDatasetId }) {
  const [password, setPassword] = useState("");
  const [activePass, setActivePass] = useState("");
  const [datasets, setDatasets] = useState<AdminDataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<PositionDatasetId>(initialDatasetId);
  const [selectedPiece, setSelectedPiece] = useState<Piece | "erase">("wK");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedDataset =
    datasets.find((dataset) => dataset.id === selectedDatasetId) ??
    positionDatasetConfigs.find((dataset) => dataset.id === selectedDatasetId)!;
  const entries: AdminEntry[] = datasets.find((dataset) => dataset.id === selectedDatasetId)?.entries ?? [];
  const booleanLabel = getDatasetBooleanLabel(selectedDataset);

  const squareOptions = useMemo(() => squares.slice().reverse(), []);

  async function fetchDatasets(pass = activePass) {
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/positions", {
      headers: {
        "x-admin-pass": pass,
      },
    });
    const data = (await response.json()) as { datasets?: AdminDataset[]; error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Не удалось открыть админку.");
      return;
    }

    setActivePass(pass);
    setDatasets(data.datasets ?? []);
  }

  async function addEntry() {
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/positions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-pass": activePass,
      },
      body: JSON.stringify({
        datasetId: selectedDatasetId,
        entry: buildEntryPayload(selectedDataset, form),
      }),
    });
    const data = (await response.json()) as { entries?: AdminEntry[]; error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Не удалось добавить позицию.");
      return;
    }

    setDatasets((current) =>
      current.map((dataset) =>
        dataset.id === selectedDatasetId ? { ...dataset, entries: data.entries ?? dataset.entries } : dataset,
      ),
    );
    setForm(emptyForm());
    setMessage("Позиция добавлена.");
  }

  async function deleteEntry(id: string) {
    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/admin/positions?datasetId=${selectedDatasetId}&id=${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-pass": activePass,
      },
    });
    const data = (await response.json()) as { entries?: AdminEntry[]; error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Не удалось удалить позицию.");
      return;
    }

    setDatasets((current) =>
      current.map((dataset) =>
        dataset.id === selectedDatasetId ? { ...dataset, entries: data.entries ?? dataset.entries } : dataset,
      ),
    );
    setMessage("Позиция удалена.");
  }

  if (!activePass) {
    return (
      <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-900">
        <section className="mx-auto max-w-md rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Вход в админку</h1>
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void fetchDatasets(password);
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Пароль"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base outline-none focus:border-stone-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60"
            >
              Войти
            </button>
            {message ? <p className="text-sm leading-6 text-rose-700">{message}</p> : null}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-900">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Админка позиций</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Выберите файл, расставьте позицию на доске и добавьте пример. Для задач дополнительно задайте ответ.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Файл</p>
            <div className="mt-4 space-y-2">
              {positionDatasetConfigs.map((dataset) => (
                <button
                  key={dataset.id}
                  type="button"
                  onClick={() => {
                    setSelectedDatasetId(dataset.id);
                    setForm(emptyForm());
                    setMessage("");
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    selectedDatasetId === dataset.id
                      ? "bg-stone-900 text-white"
                      : "border border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {dataset.title}
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-950">{selectedDataset.title}</h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">{selectedDataset.description}</p>
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <AdminBoard
                    position={form.position}
                    selectedPiece={selectedPiece}
                    onChange={(position) => setForm((current) => ({ ...current, position }))}
                  />
                  <div className="grid grid-cols-7 gap-2">
                    {pieceOptions.map((item) => (
                      <button
                        key={item.piece}
                        type="button"
                        title={item.label}
                        onClick={() => setSelectedPiece(item.piece)}
                        className={`flex aspect-square items-center justify-center rounded-xl border text-2xl ${
                          selectedPiece === item.piece
                            ? "border-stone-900 bg-stone-900 text-white"
                            : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                        }`}
                      >
                        {item.glyph}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">Ход</span>
                    <select
                      value={form.sideToMove}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          sideToMove: event.target.value === "black" ? "black" : "white",
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3"
                    >
                      <option value="white">Белые</option>
                      <option value="black">Черные</option>
                    </select>
                  </label>

                  {booleanLabel ? (
                    <label className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={form.booleanAnswer}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, booleanAnswer: event.target.checked }))
                        }
                      />
                      {booleanLabel}
                    </label>
                  ) : null}

                  {selectedDataset.kind === "mate-in-one" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-stone-700">Пример хода: откуда</span>
                        <select
                          value={form.answerFrom}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, answerFrom: event.target.value as Square }))
                          }
                          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3"
                        >
                          {squareOptions.map((square) => (
                            <option key={square} value={square}>
                              {square}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-stone-700">Пример хода: куда</span>
                        <select
                          value={form.answerTo}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, answerTo: event.target.value as Square }))
                          }
                          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3"
                        >
                          {squareOptions.map((square) => (
                            <option key={square} value={square}>
                              {square}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}

                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">
                      {selectedDataset.id === "drawExamples" ? "Комментарий / подпись" : "Пояснение"}
                    </span>
                    <textarea
                      value={form.explanation}
                      onChange={(event) => setForm((current) => ({ ...current, explanation: event.target.value }))}
                      className="mt-2 min-h-28 w-full rounded-xl border border-stone-300 px-4 py-3"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void addEntry()}
                      disabled={isLoading}
                      className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60"
                    >
                      Добавить
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(emptyForm())}
                      className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      Очистить
                    </button>
                  </div>
                  {message ? <p className="text-sm leading-6 text-stone-700">{message}</p> : null}
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">Примеры: {entries.length}</h2>
              <div className="mt-4 space-y-3">
                {entries.length === 0 ? (
                  <p className="text-sm leading-6 text-stone-600">Пока нет позиций.</p>
                ) : (
                  entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="grid gap-4 rounded-xl border border-stone-200 p-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
                    >
                      <AdminBoard position={entry.position} selectedPiece="erase" onChange={() => undefined} />
                      <div className="text-sm leading-6 text-stone-700">
                        <p className="font-semibold text-stone-950">
                          #{index + 1} · {entry.id}
                        </p>
                        <p>Ход: {entry.sideToMove === "white" ? "белые" : "черные"}</p>
                        {"isMate" in entry ? <p>Мат: {entry.isMate ? "да" : "нет"}</p> : null}
                        {"isStalemate" in entry ? <p>Пат: {entry.isStalemate ? "да" : "нет"}</p> : null}
                        {entry.exampleAnswer ? (
                          <p>
                            Пример хода: {entry.exampleAnswer.from}-{entry.exampleAnswer.to}
                          </p>
                        ) : null}
                        {entry.explanation ? <p className="mt-2 text-stone-600">{entry.explanation}</p> : null}
                        {selectedDataset.id === "drawExamples" ? (
                          <p className="mt-2 text-stone-600">{entry.caption || "Комментарий не заполнен."}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteEntry(entry.id)}
                        disabled={isLoading}
                        className="h-fit rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        Удалить
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
