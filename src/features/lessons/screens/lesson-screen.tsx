import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";

import { ErrorCard, LoadingCard } from "@/components/query-feedback";
import { LessonMarkdown } from "@/features/lessons/components/lesson-markdown";
import { LessonQuizSheet } from "@/features/lessons/components/lesson-quiz-sheet";
import { useStartLesson } from "@/features/lessons/hooks/use-lesson-progress";
import { useLesson } from "@/features/lessons/hooks/use-lessons";

export function LessonScreen() {
  const { lesson = "" } = useLocalSearchParams<{ lesson: string }>();
  const { data, error, isPending, refetch } = useLesson(lesson);
  const { mutate: startLesson } = useStartLesson();

  useEffect(() => {
    if (lesson) startLesson(lesson);
  }, [lesson, startLesson]);

  if (isPending) {
    return (
      <View className="flex-1 p-6">
        <LoadingCard label="Chargement de la leçon…" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 p-6">
        <ErrorCard
          message={error?.message ?? "Leçon introuvable."}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const returnToLessons = () => {
    router.dismissTo({
      pathname: "/learn/chapters/[chapter]",
      params: { chapter: data.chapter.slug, title: data.chapter.title },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4 pb-16 pt-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <LessonMarkdown content={data.content_markdown} />
      <LessonQuizSheet lesson={data} onFinished={returnToLessons} />
    </ScrollView>
  );
}
