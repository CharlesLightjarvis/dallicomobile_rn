import type { Level } from "@/features/learn/levels/types/level";

export type ProgressStatus = "available" | "in_progress" | "completed";

export type NextLesson = {
  slug: string;
  title: string;
  chapter_slug: string;
  level: string;
};

export type GlobalProgress = {
  progress: number;
  completed_lessons_count: number;
  lessons_count: number;
  next_lesson: NextLesson | null;
  levels: Level[];
};
