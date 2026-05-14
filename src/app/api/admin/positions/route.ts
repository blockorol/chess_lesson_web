import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import {
  getPositionDatasetConfig,
  positionDatasetConfigs,
  type PositionDatasetConfig,
} from "@/lib/admin-position-datasets";
import type { BoardPosition, Piece, Square } from "@/types/chessboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PositionEntry = {
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

const validPieces = new Set<Piece>(["wP", "wB", "wN", "wR", "wQ", "wK", "bP", "bB", "bN", "bR", "bQ", "bK"]);
const validSquares = new Set<Square>(
  ["a", "b", "c", "d", "e", "f", "g", "h"].flatMap((file) =>
    ["8", "7", "6", "5", "4", "3", "2", "1"].map((rank) => `${file}${rank}` as Square),
  ),
);

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}

function validateAccess(request: NextRequest) {
  const adminPass = process.env.ADMIN_PASS;

  if (!adminPass) {
    return "Не установлен пароль на сервере - доступ запрещен.";
  }

  if (request.headers.get("x-admin-pass") !== adminPass) {
    return "Неверный пароль.";
  }

  return null;
}

function getAbsoluteFilePath(config: PositionDatasetConfig) {
  return path.join(process.cwd(), "src", "data", path.basename(config.filePath));
}

function typeDefinitionFor(config: PositionDatasetConfig) {
  if (config.id === "mateInOne") {
    return `export type ${config.typeName} = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  exampleAnswer: {
    from: string;
    to: string;
  };
  explanation: string;
};`;
  }

  if (config.id === "drawExamples") {
    return `export type ${config.typeName} = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  caption: string;
};`;
  }

  if (config.id === "mateQuiz") {
    return `export type ${config.typeName} = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  isMate: boolean;
  explanation: string;
};`;
  }

  if (config.id === "stalemateQuiz") {
    return `export type ${config.typeName} = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  isStalemate: boolean;
  explanation: string;
};`;
  }

  return `export type ${config.typeName} = {
  id: string;
  position: BoardPosition;
  sideToMove: "white" | "black";
  explanation: string;
};`;
}

function serializeDatasetFile(config: PositionDatasetConfig, entries: PositionEntry[]) {
  return `import type { BoardPosition } from "@/types/chessboard";

${typeDefinitionFor(config)}

export const ${config.exportName}: ${config.typeName}[] = ${JSON.stringify(entries, null, 2)};
`;
}

async function readDataset(config: PositionDatasetConfig): Promise<PositionEntry[]> {
  const source = await readFile(getAbsoluteFilePath(config), "utf8");
  const match = source.match(new RegExp(`export const ${config.exportName}: ${config.typeName}\\[] = ([\\s\\S]*?);?\\s*$`));

  if (!match) {
    throw new Error(`Не удалось прочитать массив ${config.exportName}.`);
  }

  return JSON.parse(match[1]) as PositionEntry[];
}

async function writeDataset(config: PositionDatasetConfig, entries: PositionEntry[]) {
  await writeFile(getAbsoluteFilePath(config), serializeDatasetFile(config, entries), "utf8");
}

function stableEntryId(entry: Omit<PositionEntry, "id">) {
  return createHash("sha1").update(JSON.stringify(entry)).digest("hex").slice(0, 12);
}

function cleanPosition(value: unknown): BoardPosition {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Позиция должна быть объектом.");
  }

  const position: BoardPosition = {};

  for (const [square, piece] of Object.entries(value)) {
    if (!validSquares.has(square as Square)) {
      throw new Error(`Неверное поле: ${square}.`);
    }

    if (!validPieces.has(piece as Piece)) {
      throw new Error(`Неверная фигура на поле ${square}.`);
    }

    position[square as Square] = piece as Piece;
  }

  return position;
}

function cleanSquare(value: unknown, fieldName: string): Square {
  if (typeof value !== "string" || !validSquares.has(value as Square)) {
    throw new Error(`Неверное поле ${fieldName}.`);
  }

  return value as Square;
}

function cleanBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Поле ${fieldName} должно быть true или false.`);
  }

  return value;
}

function cleanEntry(config: PositionDatasetConfig, payload: unknown): Omit<PositionEntry, "id"> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Некорректные данные позиции.");
  }

  const data = payload as Record<string, unknown>;
  const sideToMove: "white" | "black" = data.sideToMove === "black" ? "black" : "white";
  const base = {
    position: cleanPosition(data.position),
    sideToMove,
    explanation: typeof data.explanation === "string" ? data.explanation.trim() : "",
  };

  if (config.id === "mateInOne") {
    const answer = data.answer as Record<string, unknown> | undefined;

    return {
      ...base,
      exampleAnswer: {
        from: cleanSquare(answer?.from, "answer.from"),
        to: cleanSquare(answer?.to, "answer.to"),
      },
    };
  }

  if (config.id === "drawExamples") {
    return {
      position: base.position,
      sideToMove: base.sideToMove,
      caption: base.explanation,
    };
  }

  if (config.id === "mateQuiz") {
    return {
      ...base,
      isMate: cleanBoolean(data.isMate, "isMate"),
    };
  }

  if (config.id === "stalemateQuiz") {
    return {
      ...base,
      isStalemate: cleanBoolean(data.isStalemate, "isStalemate"),
    };
  }

  return base;
}

export async function GET(request: NextRequest) {
  const accessError = validateAccess(request);

  if (accessError) {
    return unauthorized(accessError);
  }

  const datasets = await Promise.all(
    positionDatasetConfigs.map(async (config) => ({
      ...config,
      entries: await readDataset(config),
    })),
  );

  return NextResponse.json({ datasets });
}

export async function POST(request: NextRequest) {
  const accessError = validateAccess(request);

  if (accessError) {
    return unauthorized(accessError);
  }

  const body = (await request.json()) as { datasetId?: string; entry?: unknown };
  const config = getPositionDatasetConfig(body.datasetId ?? "");

  if (!config) {
    return NextResponse.json({ error: "Неизвестный набор позиций." }, { status: 400 });
  }

  const entryWithoutId = cleanEntry(config, body.entry);
  const entry: PositionEntry = {
    id: stableEntryId(entryWithoutId),
    ...entryWithoutId,
  };
  const entries = await readDataset(config);

  if (entries.some((item) => item.id === entry.id)) {
    return NextResponse.json({ error: "Такая позиция уже есть в файле." }, { status: 409 });
  }

  const nextEntries = [...entries, entry];
  await writeDataset(config, nextEntries);

  return NextResponse.json({ entry, entries: nextEntries });
}

export async function DELETE(request: NextRequest) {
  const accessError = validateAccess(request);

  if (accessError) {
    return unauthorized(accessError);
  }

  const { searchParams } = new URL(request.url);
  const config = getPositionDatasetConfig(searchParams.get("datasetId") ?? "");
  const id = searchParams.get("id");

  if (!config || !id) {
    return NextResponse.json({ error: "Нужны datasetId и id." }, { status: 400 });
  }

  const entries = await readDataset(config);
  const nextEntries = entries.filter((entry) => entry.id !== id);

  await writeDataset(config, nextEntries);

  return NextResponse.json({ entries: nextEntries });
}
