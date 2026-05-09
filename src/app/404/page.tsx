import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "404 | Chess Lessons",
  description: "Страница не найдена.",
};

export default function Custom404Page() {
  return <NotFoundContent />;
}
