import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { lessonService } from "@/features/lessons/services/lesson-service";

export function useLessons(chapter: string) {
  return useQuery({
    queryKey: queryKeys.lessons.list(chapter),
    queryFn: () => lessonService.getLessons(chapter),
    enabled: chapter.length > 0,
  });
}

export function useLesson(lesson: string) {
  return useQuery({
    queryKey: queryKeys.lessons.detail(lesson),
    queryFn: () => lessonService.getLesson(lesson),
    enabled: lesson.length > 0,
  });
}
