import type { CSSProperties } from "react";

export const appColors = {
  board: {
    square: {
      light: "#f4e7cf",
      dark: "#9a7b4f",
    },
    shadow: "0 18px 48px rgba(28, 25, 23, 0.16)",
    highlight: {
      boxShadow: "inset 0 0 0 4px rgba(5, 150, 105, 0.9)",
      borderRadius: "0px",
    } satisfies CSSProperties,
    forbiddenSquare: {
      backgroundColor: "rgba(239, 68, 68, 0.32)",
      boxShadow: "inset 0 0 0 3px rgba(185, 28, 28, 0.55)",
    } satisfies CSSProperties,
  },
  arrow: {
    default: "rgba(217, 119, 6, 0.85)",
    primary: "rgba(37, 99, 235, 0.82)",
    danger: "rgba(220, 38, 38, 0.85)",
    dangerSoft: "rgba(220, 38, 38, 0.82)",
    success: "rgba(5, 150, 105, 0.9)",
    successSoft: "rgba(5, 150, 105, 0.82)",
    special: "rgba(168, 85, 247, 0.82)",
  },
  overlay: {
    success: "bg-emerald-600/95 text-white",
    error: "bg-rose-600/95 text-white",
    info: "bg-stone-100/95 text-stone-800 ring-1 ring-stone-300",
  },
  elevation: {
    floatingPanel: "shadow-[0_24px_60px_rgba(28,25,23,0.12)]",
  },
} as const;

export type FeedbackTone = keyof typeof appColors.overlay;
