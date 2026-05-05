# AI Agent Instructions

## Project

This is a frontend-only chess learning website.

The site helps users learn chess through structured lessons and interactive chessboard exercises.

There is no backend. All lessons, tasks and content are stored locally in the frontend codebase.

## Tech Stack

- Node.js
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- chess.js
- react-chessboard
- Vercel for deployment

## Main Goals

Build a simple, clean and maintainable educational website for chess beginners.

Prioritize:
- fast development
- readable code
- reusable components
- simple data structures
- mobile-friendly UI
- easy deployment to Vercel

## Site Map

### `/`

Home page.

Should include:
- project title
- short explanation
- call-to-action to start lessons
- link to lessons list

### `/lessons`

Lessons index page.

Should include:
- list of lessons
- lesson cards
- lesson title
- short description
- difficulty level
- link to lesson page

### `/lessons/[slug]`

Single lesson page.

Should include:
- lesson title
- lesson content
- examples
- optional interactive chess task
- navigation back to lessons

## Components

### `ChessTaskBoard`

Interactive chessboard component.

Responsibilities:
- show predefined chess position
- allow user moves
- validate moves using chess.js
- show success/failure feedback
- support simple tasks like “find the best move”

### `LessonCard`

Card component for lesson preview.

### `Layout/Header`

Simple navigation header.

## Data

Store lessons in:

```txt
src/data/lessons.ts
