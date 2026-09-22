import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { ErrorCard, LoadingCard } from "@/components/query-feedback";

import {
  LessonQuizPage,
  type LessonQuizFinishedResult,
} from "@/features/learn/lessons/components/lesson-quiz-page";
import { useStartLesson } from "@/features/learn/lessons/hooks/use-lesson-progress";
import { useLesson } from "@/features/learn/lessons/hooks/use-lessons";

type QuizParams = {
  lesson: string;
  title?: string;
};

export function QuizScreen() {
  const { lesson = "" } = useLocalSearchParams<QuizParams>();
  const { data, error, isPending, refetch } = useLesson(lesson);
  const { mutate: startLesson } = useStartLesson();

  useEffect(() => {
    if (lesson) {
      startLesson(lesson);
    }
  }, [lesson, startLesson]);

  if (isPending) {
    return (
      <View className="flex-1 bg-app-background p-6">
        <LoadingCard label="Chargement du quiz…" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 bg-app-background p-6">
        <ErrorCard
          message={error?.message ?? "Quiz introuvable."}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const handleFinished = (result: LessonQuizFinishedResult) => {
    router.replace({
      pathname: "/learn/quiz-success/[lesson]",
      params: {
        lesson: data.slug,
        title: data.title,
        chapterSlug: data.chapter.slug,
        chapterTitle: data.chapter.title,
        correctAnswers: String(result.correctAnswers),
        totalQuestions: String(result.totalQuestions),
        score: String(result.score),
        nextLessonSlug: result.nextLesson?.slug ?? "",
        nextLessonTitle: result.nextLesson?.title ?? "",
        nextChapterSlug: result.nextLesson?.chapter_slug ?? "",
        nextLevel: result.nextLesson?.level ?? "",
      },
    });
  };

  return <LessonQuizPage lesson={data} onFinished={handleFinished} />;
}
