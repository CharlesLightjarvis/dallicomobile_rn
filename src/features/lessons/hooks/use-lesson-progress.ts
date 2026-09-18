import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { lessonService } from "@/features/lessons/services/lesson-service";

export function useStartLesson() {
  return useMutation({ mutationFn: lessonService.start });
}

export function useSubmitExercise(lesson: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ exercise, answer }: { exercise: string; answer: string }) => lessonService.attempt(exercise, answer),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.lessons.detail(lesson) }),
  });
}

export function useCompleteLesson(lesson: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => lessonService.complete(lesson),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.levels.all }),
        client.invalidateQueries({ queryKey: queryKeys.chapters.all }),
        client.invalidateQueries({ queryKey: queryKeys.lessons.all }),
        client.invalidateQueries({ queryKey: queryKeys.progress.all }),
      ]);
    },
  });
}
