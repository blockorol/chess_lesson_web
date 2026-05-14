import type { Arrow, BoardPosition, Piece, Square } from "@/types/chessboard";

export type PiecePlacement = string;
export type SquareStyleMap = Partial<Record<Square, Record<string, string | number>>>;
export type InvalidPracticeMoveReason =
  | "piece-movement"
  | "forbidden-target"
  | "forbidden-cross"
  | "other";

export type BoardArrow = {
  from: Square;
  to: Square;
  color?: string;
};

export type LessonPieceSymbol = "K" | "Q" | "R" | "B" | "N" | "P";
export type PracticeMode = "single-target" | "path-target" | "path-target-with-obstacles" | "capture-target";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

const pieceMap: Record<string, Piece> = {
  K: "wK",
  Q: "wQ",
  R: "wR",
  B: "wB",
  N: "wN",
  P: "wP",
  k: "bK",
  q: "bQ",
  r: "bR",
  b: "bB",
  n: "bN",
  p: "bP",
};

export function placementsToPosition(placements: PiecePlacement[]): BoardPosition {
  return placements.reduce<BoardPosition>((position, placement) => {
    const normalizedPlacement = placement.trim();
    const match = normalizedPlacement.match(/^([KQRBNPkqrbnp])([a-h][1-8])$/);

    if (!match) {
      return position;
    }

    const [, pieceSymbol, square] = match;
    position[square as Square] = pieceMap[pieceSymbol];

    return position;
  }, {});
}

export function arrowsToReactChessboard(arrows: BoardArrow[]): Arrow[] {
  return arrows.map(({ from, to, color }) => [from, to, color]);
}

export function getAllSquares(): Square[] {
  return ranks.flatMap((rank) =>
    files.map((file) => `${file}${rank}` as Square),
  );
}

export function getRandomSquare(filter?: (square: Square) => boolean): Square {
  const squares = filter ? getAllSquares().filter(filter) : getAllSquares();
  return squares[Math.floor(Math.random() * squares.length)];
}

export function getPiecePlacement(
  piece: LessonPieceSymbol,
  square: Square,
): PiecePlacement {
  return `${piece}${square}`;
}

export function getReachableSquares(
  piece: LessonPieceSymbol,
  square: Square,
): Square[] {
  const [file, rank] = square.split("") as [typeof files[number], typeof ranks[number]];
  const fileIndex = files.indexOf(file);
  const rankIndex = ranks.indexOf(rank);

  const byDelta = (fileDelta: number, rankDelta: number) => {
    const nextFile = files[fileIndex + fileDelta];
    const nextRank = ranks[rankIndex + rankDelta];
    return nextFile && nextRank ? (`${nextFile}${nextRank}` as Square) : null;
  };

  const ray = (fileDelta: number, rankDelta: number) => {
    const squares: Square[] = [];
    let currentFile = fileIndex + fileDelta;
    let currentRank = rankIndex + rankDelta;

    while (files[currentFile] && ranks[currentRank]) {
      squares.push(`${files[currentFile]}${ranks[currentRank]}` as Square);
      currentFile += fileDelta;
      currentRank += rankDelta;
    }

    return squares;
  };

  switch (piece) {
    case "K":
      return [
        byDelta(-1, -1),
        byDelta(0, -1),
        byDelta(1, -1),
        byDelta(-1, 0),
        byDelta(1, 0),
        byDelta(-1, 1),
        byDelta(0, 1),
        byDelta(1, 1),
      ].filter((item): item is Square => Boolean(item));
    case "Q":
      return [
        ...ray(1, 0),
        ...ray(-1, 0),
        ...ray(0, 1),
        ...ray(0, -1),
        ...ray(1, 1),
        ...ray(1, -1),
        ...ray(-1, 1),
        ...ray(-1, -1),
      ];
    case "R":
      return [...ray(1, 0), ...ray(-1, 0), ...ray(0, 1), ...ray(0, -1)];
    case "B":
      return [...ray(1, 1), ...ray(1, -1), ...ray(-1, 1), ...ray(-1, -1)];
    case "N":
      return [
        byDelta(-2, -1),
        byDelta(-2, 1),
        byDelta(-1, -2),
        byDelta(-1, 2),
        byDelta(1, -2),
        byDelta(1, 2),
        byDelta(2, -1),
        byDelta(2, 1),
      ].filter((item): item is Square => Boolean(item));
    case "P": {
      const moves: Square[] = [];
      const oneStep = byDelta(0, 1);

      if (oneStep) {
        moves.push(oneStep);
      }

      return moves;
    }
  }
}

function getMoveDelta(
  source: Square,
  target: Square,
): {
  fileDelta: number;
  rankDelta: number;
} {
  const [sourceFile, sourceRank] = source.split("") as [typeof files[number], typeof ranks[number]];
  const [targetFile, targetRank] = target.split("") as [typeof files[number], typeof ranks[number]];

  return {
    fileDelta: files.indexOf(targetFile) - files.indexOf(sourceFile),
    rankDelta: ranks.indexOf(targetRank) - ranks.indexOf(sourceRank),
  };
}

export function getIntermediateSquares(source: Square, target: Square): Square[] {
  const { fileDelta, rankDelta } = getMoveDelta(source, target);
  const fileStep = Math.sign(fileDelta);
  const rankStep = Math.sign(rankDelta);

  if (Math.abs(fileDelta) <= 1 && Math.abs(rankDelta) <= 1) {
    return [];
  }

  if (fileDelta !== 0 && rankDelta !== 0 && Math.abs(fileDelta) !== Math.abs(rankDelta)) {
    return [];
  }

  if (fileDelta !== 0 && rankDelta !== 0 && Math.abs(fileDelta) === 1) {
    return [];
  }

  if (fileDelta !== 0 && rankDelta !== 0 && Math.abs(fileDelta) === 2 && Math.abs(rankDelta) === 1) {
    return [];
  }

  if (rankDelta !== 0 && fileDelta !== 0 && Math.abs(rankDelta) === 2 && Math.abs(fileDelta) === 1) {
    return [];
  }

  const steps = Math.max(Math.abs(fileDelta), Math.abs(rankDelta));
  const squares: Square[] = [];

  for (let step = 1; step < steps; step += 1) {
    const nextFile = files[files.indexOf(source[0] as typeof files[number]) + fileStep * step];
    const nextRank = ranks[ranks.indexOf(source[1] as typeof ranks[number]) + rankStep * step];

    if (nextFile && nextRank) {
      squares.push(`${nextFile}${nextRank}` as Square);
    }
  }

  return squares;
}

type ReachableSquareOptions = {
  forbiddenSquares?: Square[];
  captureTarget?: Square | null;
  mode?: PracticeMode;
};

function isBlockedByForbiddenSquares(
  piece: LessonPieceSymbol,
  source: Square,
  target: Square,
  forbiddenSquares: Set<Square>,
): boolean {
  if (forbiddenSquares.has(target)) {
    return true;
  }

  if (piece === "N") {
    return false;
  }

  return getIntermediateSquares(source, target).some((square) =>
    forbiddenSquares.has(square),
  );
}

export function getPracticeReachableSquares(
  piece: LessonPieceSymbol,
  square: Square,
  options: ReachableSquareOptions = {},
): Square[] {
  const forbiddenSquares = new Set(options.forbiddenSquares ?? []);
  const captureTarget = options.captureTarget ?? null;
  const mode = options.mode ?? "single-target";

  if (piece === "P" && mode === "capture-target") {
    const [file, rank] = square.split("") as [typeof files[number], typeof ranks[number]];
    const fileIndex = files.indexOf(file);
    const rankIndex = ranks.indexOf(rank);
    const oneStepForward = ranks[rankIndex + 1]
      ? (`${file}${ranks[rankIndex + 1]}` as Square)
      : null;
    const captureSquares = [fileIndex - 1, fileIndex + 1]
      .map((nextFileIndex) => {
        const nextFile = files[nextFileIndex];
        const nextRank = ranks[rankIndex + 1];
        return nextFile && nextRank ? (`${nextFile}${nextRank}` as Square) : null;
      })
      .filter((item): item is Square => Boolean(item));

    return [
      ...(oneStepForward && oneStepForward !== captureTarget ? [oneStepForward] : []),
      ...(captureTarget && captureSquares.includes(captureTarget) ? [captureTarget] : []),
    ];
  }

  return getReachableSquares(piece, square).filter((target) => {
    if (isBlockedByForbiddenSquares(piece, square, target, forbiddenSquares)) {
      return false;
    }

    if (piece !== "N") {
      const crossesCaptureTarget =
        captureTarget !== null &&
        getIntermediateSquares(square, target).includes(captureTarget);

      if (crossesCaptureTarget) {
        return false;
      }
    }

    if (mode === "capture-target") {
      if (captureTarget === null) {
        return true;
      }

      if (target === captureTarget) {
        return true;
      }

      return target !== captureTarget;
    }

    return true;
  });
}

export function getInvalidPracticeMoveReason(
  piece: LessonPieceSymbol,
  source: Square,
  target: Square,
  options: ReachableSquareOptions = {},
): InvalidPracticeMoveReason {
  const forbiddenSquares = new Set(options.forbiddenSquares ?? []);
  const mode = options.mode ?? "single-target";
  const captureTarget = options.captureTarget ?? null;

  if (forbiddenSquares.has(target)) {
    return "forbidden-target";
  }

  if (
    piece !== "N" &&
    getIntermediateSquares(source, target).some((square) => forbiddenSquares.has(square))
  ) {
    return "forbidden-cross";
  }

  if (piece === "P" && mode === "capture-target") {
    const legalPawnMoves = getPracticeReachableSquares(piece, source, options);
    return legalPawnMoves.includes(target) ? "other" : "piece-movement";
  }

  if (!getReachableSquares(piece, source).includes(target)) {
    return "piece-movement";
  }

  if (piece !== "N" && captureTarget !== null) {
    const crossesCaptureTarget = getIntermediateSquares(source, target).includes(captureTarget);

    if (crossesCaptureTarget) {
      return "other";
    }
  }

  return "other";
}

export function findShortestPath(
  piece: LessonPieceSymbol,
  start: Square,
  target: Square,
  options: ReachableSquareOptions = {},
): Square[] | null {
  const queue: Square[][] = [[start]];
  const visited = new Set<Square>([start]);

  while (queue.length > 0) {
    const path = queue.shift();

    if (!path) {
      break;
    }

    const current = path[path.length - 1];

    if (current === target) {
      return path;
    }

    const nextSquares = getPracticeReachableSquares(piece, current, options);

    for (const nextSquare of nextSquares) {
      if (visited.has(nextSquare)) {
        continue;
      }

      visited.add(nextSquare);
      queue.push([...path, nextSquare]);
    }
  }

  return null;
}

export function getRandomSquares(count: number, exclude: Square[] = []): Square[] {
  const excluded = new Set(exclude);
  const squares = getAllSquares().filter((square) => !excluded.has(square));
  const result: Square[] = [];

  while (result.length < count && squares.length > 0) {
    const index = Math.floor(Math.random() * squares.length);
    const [square] = squares.splice(index, 1);
    result.push(square);
  }

  return result;
}

export function getRandomReachableTarget(
  piece: LessonPieceSymbol,
  square: Square,
): Square {
  const reachableSquares = getReachableSquares(piece, square);
  return reachableSquares[Math.floor(Math.random() * reachableSquares.length)];
}

export type ChessColor = "white" | "black";
export type BoardMove = {
  from: Square;
  to: Square;
};

const pieceSymbolByPiece: Record<Piece, LessonPieceSymbol> = {
  wK: "K",
  wQ: "Q",
  wR: "R",
  wB: "B",
  wN: "N",
  wP: "P",
  bK: "K",
  bQ: "Q",
  bR: "R",
  bB: "B",
  bN: "N",
  bP: "P",
};

function getPieceColor(piece: Piece): ChessColor {
  return piece.startsWith("w") ? "white" : "black";
}

function getPieceSymbol(piece: Piece): LessonPieceSymbol {
  return pieceSymbolByPiece[piece];
}

function getPieceForColor(piece: LessonPieceSymbol, color: ChessColor): Piece {
  const prefix = color === "white" ? "w" : "b";
  return `${prefix}${piece}` as Piece;
}

function getOppositeColor(color: ChessColor): ChessColor {
  return color === "white" ? "black" : "white";
}

function getPawnDirection(color: ChessColor): 1 | -1 {
  return color === "white" ? 1 : -1;
}

function getSquare(fileIndex: number, rankIndex: number): Square | null {
  const file = files[fileIndex];
  const rank = ranks[rankIndex];
  return file && rank ? (`${file}${rank}` as Square) : null;
}

function getSquareParts(square: Square): {
  fileIndex: number;
  rankIndex: number;
} {
  const [file, rank] = square.split("") as [typeof files[number], typeof ranks[number]];

  return {
    fileIndex: files.indexOf(file),
    rankIndex: ranks.indexOf(rank),
  };
}

function isPathClear(board: BoardPosition, source: Square, target: Square): boolean {
  return getIntermediateSquares(source, target).every((square) => !board[square]);
}

export function positionToPlacements(position: BoardPosition): PiecePlacement[] {
  return Object.entries(position).map(([square, piece]) => {
    const symbol = piece[0] === "w" ? piece[1] : piece[1].toLowerCase();
    return `${symbol}${square}`;
  });
}

export function setBoardPiece(
  board: BoardPosition,
  square: Square,
  piece: Piece | null,
): BoardPosition {
  const nextBoard = { ...board };

  if (piece) {
    nextBoard[square] = piece;
  } else {
    delete nextBoard[square];
  }

  return nextBoard;
}

export function applyBoardMove(board: BoardPosition, move: BoardMove): BoardPosition {
  const piece = board[move.from];

  if (!piece) {
    return board;
  }

  const nextBoard = { ...board };
  delete nextBoard[move.from];
  nextBoard[move.to] = piece;

  return nextBoard;
}

export function findKingSquare(board: BoardPosition, color: ChessColor): Square | null {
  const king = getPieceForColor("K", color);
  const entry = Object.entries(board).find(([, piece]) => piece === king);

  return entry ? (entry[0] as Square) : null;
}

export function getAttackOrigins(
  target: Square,
  attackerPiece: LessonPieceSymbol,
  attackerColor: ChessColor,
): Square[] {
  if (attackerPiece === "P") {
    const { fileIndex, rankIndex } = getSquareParts(target);
    const direction = getPawnDirection(attackerColor);

    return [fileIndex - 1, fileIndex + 1]
      .map((nextFileIndex) => getSquare(nextFileIndex, rankIndex - direction))
      .filter((square): square is Square => square !== null);
  }

  return getReachableSquares(attackerPiece, target);
}

export function getMoveOrigins(
  target: Square,
  movingPiece: LessonPieceSymbol,
  movingColor: ChessColor,
  board: BoardPosition = {},
): Square[] {
  if (movingPiece === "P") {
    const { fileIndex, rankIndex } = getSquareParts(target);
    const direction = getPawnDirection(movingColor);
    const oneStep = getSquare(fileIndex, rankIndex - direction);
    const twoStep = getSquare(fileIndex, rankIndex - direction * 2);
    const startRank = movingColor === "white" ? "2" : "7";

    return [
      ...(oneStep && !board[oneStep] ? [oneStep] : []),
      ...(twoStep && twoStep.endsWith(startRank) && !board[twoStep] && !board[oneStep ?? target]
        ? [twoStep]
        : []),
    ];
  }

  return getReachableSquares(movingPiece, target);
}

export function doesPieceAttackSquare(
  board: BoardPosition,
  source: Square,
  target: Square,
): boolean {
  const piece = board[source];

  if (!piece || source === target) {
    return false;
  }

  const pieceSymbol = getPieceSymbol(piece);
  const color = getPieceColor(piece);

  if (!getAttackOrigins(target, pieceSymbol, color).includes(source)) {
    return false;
  }

  if (pieceSymbol === "N" || pieceSymbol === "K" || pieceSymbol === "P") {
    return true;
  }

  return isPathClear(board, source, target);
}

export function isSquareAttacked(
  board: BoardPosition,
  square: Square,
  byColor: ChessColor,
): boolean {
  return Object.entries(board).some(([source, piece]) => {
    if (getPieceColor(piece) !== byColor) {
      return false;
    }

    return doesPieceAttackSquare(board, source as Square, square);
  });
}

export function getCheckingPieces(
  board: BoardPosition,
  kingColor: ChessColor,
): Square[] {
  const kingSquare = findKingSquare(board, kingColor);

  if (!kingSquare) {
    return [];
  }

  const attackerColor = getOppositeColor(kingColor);

  return Object.entries(board)
    .filter(([, piece]) => getPieceColor(piece) === attackerColor)
    .filter(([source]) => doesPieceAttackSquare(board, source as Square, kingSquare))
    .map(([source]) => source as Square);
}

export function isInCheck(board: BoardPosition, color: ChessColor): boolean {
  return getCheckingPieces(board, color).length > 0;
}

export function getPseudoLegalMovesForPiece(
  board: BoardPosition,
  source: Square,
): Square[] {
  const piece = board[source];

  if (!piece) {
    return [];
  }

  const color = getPieceColor(piece);
  const opponentColor = getOppositeColor(color);
  const pieceSymbol = getPieceSymbol(piece);

  if (pieceSymbol === "P") {
    const { fileIndex, rankIndex } = getSquareParts(source);
    const direction = getPawnDirection(color);
    const oneStep = getSquare(fileIndex, rankIndex + direction);
    const twoStep = getSquare(fileIndex, rankIndex + direction * 2);
    const startRank = color === "white" ? "2" : "7";
    const captureTargets = [fileIndex - 1, fileIndex + 1]
      .map((nextFileIndex) => getSquare(nextFileIndex, rankIndex + direction))
      .filter((square): square is Square => {
        if (!square) {
          return false;
        }

        const targetPiece = board[square];
        return Boolean(targetPiece && getPieceColor(targetPiece) === opponentColor);
      });

    return [
      ...(oneStep && !board[oneStep] ? [oneStep] : []),
      ...(source.endsWith(startRank) && oneStep && twoStep && !board[oneStep] && !board[twoStep]
        ? [twoStep]
        : []),
      ...captureTargets,
    ];
  }

  return getReachableSquares(pieceSymbol, source).filter((target) => {
    const targetPiece = board[target];

    if (targetPiece && getPieceColor(targetPiece) === color) {
      return false;
    }

    if ((pieceSymbol === "B" || pieceSymbol === "R" || pieceSymbol === "Q") && !isPathClear(board, source, target)) {
      return false;
    }

    return true;
  });
}

export function getLegalMovesForColor(board: BoardPosition, color: ChessColor): BoardMove[] {
  return Object.entries(board)
    .filter(([, piece]) => getPieceColor(piece) === color)
    .flatMap(([source]) =>
      getPseudoLegalMovesForPiece(board, source as Square)
        .map((target) => ({
          from: source as Square,
          to: target,
        }))
        .filter((move) => !isInCheck(applyBoardMove(board, move), color)),
    );
}

export function isCheckmate(board: BoardPosition, color: ChessColor): boolean {
  return isInCheck(board, color) && getLegalMovesForColor(board, color).length === 0;
}

export function isStalemate(board: BoardPosition, color: ChessColor): boolean {
  return !isInCheck(board, color) && getLegalMovesForColor(board, color).length === 0;
}

export function getBlockingSquaresBetween(
  board: BoardPosition,
  attackerSquare: Square,
  kingSquare: Square,
): Square[] {
  const attacker = board[attackerSquare];

  if (!attacker) {
    return [];
  }

  const attackerSymbol = getPieceSymbol(attacker);

  if (attackerSymbol === "N" || attackerSymbol === "K" || attackerSymbol === "P") {
    return [];
  }

  return getIntermediateSquares(attackerSquare, kingSquare);
}

export function getCheckEscapeMoves(board: BoardPosition, color: ChessColor): {
  block: BoardMove[];
  capture: BoardMove[];
  moveKing: BoardMove[];
} {
  const kingSquare = findKingSquare(board, color);
  const checkingPieces = getCheckingPieces(board, color);
  const legalMoves = getLegalMovesForColor(board, color);

  if (!kingSquare || checkingPieces.length === 0) {
    return {
      block: [],
      capture: [],
      moveKing: [],
    };
  }

  const checkingPieceSet = new Set(checkingPieces);
  const blockingSquares = new Set(
    checkingPieces.flatMap((attackerSquare) =>
      getBlockingSquaresBetween(board, attackerSquare, kingSquare),
    ),
  );

  return {
    block: legalMoves.filter((move) => move.from !== kingSquare && blockingSquares.has(move.to)),
    capture: legalMoves.filter((move) => move.from !== kingSquare && checkingPieceSet.has(move.to)),
    moveKing: legalMoves.filter((move) => move.from === kingSquare && !checkingPieceSet.has(move.to)),
  };
}
