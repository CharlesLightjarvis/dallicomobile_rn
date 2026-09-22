import { api } from "@/lib/api";
import type { ExerciseAttemptResult } from "@/features/learn/lessons/types/exercise";
import type { Lesson, LessonSummary } from "@/features/learn/lessons/types/lesson";
import type { NextLesson, ProgressStatus } from "@/features/progress/types/progress";
import type { ApiSuccessResponse, LaravelResourceResponse } from "@/lib/types/api-response";

export const lessonService = {
  async getLessons(chapter: string): Promise<LessonSummary[]> {
    return (await api.get<LaravelResourceResponse<LessonSummary[]>>(`/api/v1/chapters/${encodeURIComponent(chapter)}/lessons`)).data.data;
  },
  async getLesson(lesson: string): Promise<Lesson> {
    return (await api.get<LaravelResourceResponse<Lesson>>(`/api/v1/lessons/${encodeURIComponent(lesson)}`)).data.data;
  },
  start: async (lesson: string) =>
    (await api.post<ApiSuccessResponse<{ status: ProgressStatus }>>(`/api/v1/lessons/${encodeURIComponent(lesson)}/start`)).data.data,
  attempt: async (exercise: string, answer: string) =>
    (await api.post<ApiSuccessResponse<ExerciseAttemptResult>>(`/api/v1/exercises/${exercise}/attempt`, { answer })).data.data,
  complete: async (lesson: string) =>
    (await api.post<ApiSuccessResponse<{ status: ProgressStatus; score: number; next_lesson: NextLesson | null }>>(`/api/v1/lessons/${encodeURIComponent(lesson)}/complete`)).data.data,
};
