import type { ProgressStatus } from "@/features/progress/types/progress";

export type Chapter = {
  slug: string;
  level: string;
  level_label: string;
  title: string;
  description: string | null;
  image: string | null;
  order: number;
  lessons_count: number;
  completed_lessons_count: number;
  progress: number;
  status: ProgressStatus;
};
