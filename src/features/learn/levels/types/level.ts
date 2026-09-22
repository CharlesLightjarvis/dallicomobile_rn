import type { ProgressStatus } from "@/features/progress/types/progress";

export type Level = {
  code: string;
  label: string;
  title: string;
  description: string | null;
  order: number;
  status: ProgressStatus;
  progress: number;
  completed_lessons_count: number;
  lessons_count: number;
};
