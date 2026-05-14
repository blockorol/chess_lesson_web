# AI Agent Instructions

## Project

Frontend-only chess learning website for beginners.

The site teaches chess through structured lessons and interactive chessboard exercises. There is no backend: lesson content, tasks, and exercise configuration live in the frontend codebase.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui conventions via `components.json`
- chess.js
- react-chessboard
- Vercel deployment

## Main Goals

Prioritize fast development, readable code, reusable components, simple data structures, mobile-friendly UI, and easy Vercel deployment.

## Commands

- `npm run dev` - start local Next.js dev server
- `npm run build` - production build
- `npm run lint` - ESLint

## High-Level Routes

- `/` - currently redirects to `/lessons`
- `/lessons` - lessons index, renders all lessons from `src/data/lesson-catalog.ts`
- `/lessons/[slug]` - single lesson page, statically generated from lesson slugs
- `/about` - static project/about page
- `/admin` - password-protected local position admin; hidden header, uses `ADMIN_PASS`
- `/api/admin/positions` - admin-only API for reading/writing curated position files
- `/404`, `not-found.tsx`, `[...not-found]` - not-found/redirect handling

## Project Map

### App Router

- `src/app/layout.tsx` - root layout, global fonts, header, global metadata wrapper
- `src/app/globals.css` - Tailwind/global styles
- `src/app/page.tsx` - home entry point; redirects to `/lessons`
- `src/app/lessons/page.tsx` - lessons index page
- `src/app/lessons/[slug]/page.tsx` - lesson detail page; uses `generateStaticParams`, `generateMetadata`, `LessonIntro`, and `LessonSubtopics`
- `src/app/about/page.tsx` - about page
- `src/app/admin/page.tsx` - position admin entry point; denies access when `ADMIN_PASS` is missing
- `src/app/api/admin/positions/route.ts` - admin API; validates `x-admin-pass` and writes local TS data files
- `src/app/not-found.tsx` - Next.js not-found UI
- `src/app/404/page.tsx` - explicit 404 route
- `src/app/[...not-found]/page.tsx` - catch-all redirect handling

### Lesson Data And Types

- `src/data/lesson-catalog.ts` - lesson aggregator/order only. It imports individual lesson files.
- `src/data/lessons/*.ts` - canonical files for lesson content. Add or edit each lesson here.
- `src/types/lesson.ts` - lesson shape: `Lesson`, `LessonSubtopic`, `LessonDemo`, `LessonPractice`, status and piece symbols.
- `src/types/chessboard.ts` - board primitives: squares, pieces, board position, arrows.

Important: lesson content lives in `src/data/lessons/*.ts`; `src/data/lesson-catalog.ts` should stay small.

### Components

- `src/components/header.tsx` - top navigation and lesson links
- `src/components/lesson-card.tsx` - card used on `/lessons`
- `src/components/lesson-intro.tsx` - intro/content block for lesson pages
- `src/components/lesson-subtopics.tsx` - accordion/list wrapper for lesson subtopics
- `src/components/lesson-piece-move-levels.tsx` - UI shell for one piece/subtopic, level selection, demo/practice layout
- `src/components/piece-demo-board.tsx` - non-interactive demo board for generated piece moves or custom positions
- `src/components/piece-level-practice.tsx` - interactive practice logic for levels 1-5
- `src/components/chess-board.tsx` - shared `react-chessboard` wrapper; handles piece placement, arrows, highlights, drag/drop, overlays, responsive width
- `src/components/check-and-checkmate-lesson.tsx` - custom lesson UI and generated tasks for check, checkmate, stalemate, and draw concepts
- `src/components/opening-lesson.tsx` - custom lesson UI for "Как играть если не умеешь играть. Начало." with opening-development diagrams
- `src/components/three-simple-questions-lesson.tsx` - custom lesson UI for "Три простых вопроса" with the decision checklist and practice prompt
- `src/components/material-advantage-lesson.tsx` - custom lesson UI for converting material advantage into exchanges and winning plans
- `src/components/not-found-content.tsx` - shared not-found content

### Chess Logic

- `src/lib/chess.ts` - core board utilities and exercise helpers:
  - converts placement strings like `Ke1` into board positions
  - converts arrows for `react-chessboard`
  - generates reachable squares by piece
  - checks attacks, check, legal moves, checkmate, stalemate, and ways to escape check
  - handles forbidden squares and capture targets
  - finds shortest paths for multi-move practice
  - creates random squares/targets
- `src/lib/colors.ts` - functional design color tokens for board squares, arrows, highlights, forbidden squares, and feedback overlays. Prefer this over hard-coded hex/rgba values.
- `src/lib/utils.ts` - `cn()` helper for Tailwind class merging
- `src/data/checkmate-positions.ts` - curated datasets for "is this mate?" and "mate in 1" tasks
- `src/data/stalemate-positions.ts` - curated datasets for stalemate examples and quizzes
- `src/data/mate-quiz-positions.ts` - admin-managed "is this mate?" positions
- `src/data/mate-in-one-positions.ts` - admin-managed "mate in 1" positions
- `src/data/stalemate-example-positions.ts` - admin-managed stalemate examples
- `src/data/stalemate-quiz-positions.ts` - admin-managed "is this stalemate?" positions
- `src/data/draw-example-positions.ts` - admin-managed draw examples with captions
- `src/lib/admin-position-datasets.ts` - metadata for the admin-managed position files

### Public Assets

- `public/*.svg` - default/static SVG assets from the starter app
- `src/app/icon.svg`, `src/app/favicon.ico` - app icons

## Common Change Paths

- Add a new lesson:
  1. Create `src/data/lessons/<lesson-slug>.ts`.
  2. Export a `Lesson` object with `slug`, `title`, `short_description`, `status`, and content fields.
  3. Import it into `src/data/lesson-catalog.ts` and add it to the `lessons` array in display order.

- Add a new lesson subtopic for piece movement:
  1. Add a `subtopics` entry in `src/data/lesson-catalog.ts`.
  2. Use `demo.type: "generated-piece"` for automatic move arrows, or `demo.type: "custom-position"` for explicit placements/arrows.
  3. Use `practice.type: "piece-target"` for current interactive practice, or `coming-soon` for placeholder content.

- Change board visuals or drag/drop surface:
  - Start in `src/components/chess-board.tsx`.
  - Use functional colors from `src/lib/colors.ts`; do not add new hard-coded hex/rgba values in components unless a one-off asset requires it.

- Change legal movement, target generation, obstacles, or pathfinding:
  - Start in `src/lib/chess.ts`.
  - Then check `src/components/piece-level-practice.tsx`, which consumes those helpers.

- Change check/checkmate/stalemate logic:
  - Start in `src/lib/chess.ts`.
  - Look for helpers such as `getAttackOrigins`, `getMoveOrigins`, `isInCheck`, `isCheckmate`, `isStalemate`, and `getCheckEscapeMoves`.
  - Generated lesson tasks live in `src/components/check-and-checkmate-lesson.tsx`.
  - Curated mate/stalemate datasets live in `src/data/checkmate-positions.ts` and `src/data/stalemate-positions.ts`.
  - Admin-managed source files are split into the files listed above; the two legacy mate/stalemate files re-export their related datasets.

- Change the position admin:
  - Start in `src/components/admin-positions-panel.tsx` for UI.
  - Start in `src/app/api/admin/positions/route.ts` for file persistence and password checks.
  - `ADMIN_PASS` must be set. Local example: `.env.local` can use `ADMIN_PASS=admin_pass`; `.env.example` documents this.

- Change the five practice levels:
  - Start in `src/components/piece-level-practice.tsx`.
  - Level labels/descriptions are in `src/components/lesson-piece-move-levels.tsx`.

- Change lesson page layout:
  - Start in `src/app/lessons/[slug]/page.tsx`.
  - Then inspect `LessonIntro`, `LessonSubtopics`, and `LessonPieceMoveLevels`.
  - Custom lesson bodies currently include `CheckAndCheckmateLesson`, `OpeningLesson`, `ThreeSimpleQuestionsLesson`, and `MaterialAdvantageLesson`.

- Change lesson index cards:
  - Start in `src/app/lessons/page.tsx` and `src/components/lesson-card.tsx`.

## Data Conventions

- Lesson slugs are the route ids.
- Lesson cards and metadata use `short_description`.
- Lesson `status` is `"published"` or `"in-development"`.
- There is no lesson difficulty/level field.
- Piece placement strings use a piece letter followed by a square, for example `Ke1`, `Ra1`, `pd4`.
- Uppercase pieces are white; lowercase pieces are black.
- Piece symbols used for lesson movement practice: `K`, `Q`, `R`, `B`, `N`, `P`.
- `S` is used in lesson data for the "special moves" subtopic and is not a movable practice piece.
- Board squares use algebraic coordinates from `a1` to `h8`.

## Implementation Notes For Agents

- Preserve existing user edits. This repo may have a dirty worktree.
- Prefer small, local changes over broad refactors.
- Use the existing data-first lesson model before introducing new state or routing.
- Keep interactive chess behavior inside `src/lib/chess.ts` and board/practice components rather than scattering rules through pages.
- Validate meaningful changes with `npm run lint` and, for route/data changes, `npm run build` when practical.
