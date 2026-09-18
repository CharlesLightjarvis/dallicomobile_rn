import type { Chapter } from "@/features/chapters/types/chapter";
import type { Exercise } from "@/features/lessons/types/exercise";
import type { ProgressStatus } from "@/features/progress/types/progress";

export type LessonSummary = {
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  order: number;
  exercises_count: number;
  answered_exercises_count: number;
  progress: number;
  status: ProgressStatus;
};

export type Lesson = Omit<LessonSummary, "exercises_count"> & {
  chapter: Chapter;
  content_markdown: string;
  exercises: Exercise[];
  can_complete: boolean;
  score: number | null;
};
