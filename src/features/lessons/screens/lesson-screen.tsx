import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorCard, LoadingCard } from "@/components/query-feedback";
import { GameButton } from "@/components/ui/game-button";

import { LessonMarkdown } from "@/features/lessons/components/lesson-markdown";
import { LessonQuizSheet } from "@/features/lessons/components/lesson-quiz-sheet";

import { useStartLesson } from "@/features/lessons/hooks/use-lesson-progress";
import { useLesson } from "@/features/lessons/hooks/use-lessons";

export function LessonScreen() {
  const { lesson = "" } = useLocalSearchParams<{
    lesson: string;
  }>();

  const { data, error, isPending, refetch } = useLesson(lesson);

  const { mutate: startLesson } = useStartLesson();

  const [isRead, setIsRead] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (lesson) {
      startLesson(lesson);
    }
  }, [lesson, startLesson]);

  if (isPending) {
    return (
      <View className="flex-1 bg-app-background p-6">
        <LoadingCard label="Chargement de la leçon…" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 bg-app-background p-6">
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
      params: {
        chapter: data.chapter.slug,
        title: data.chapter.title,
      },
    });
  };

  const handleToggleRead = () => {
    setIsRead((current) => !current);

    /*
     * Plus tard :
     * brancher ici la mutation backend
     * lu / non lu.
     */
  };

  const handleQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <View className="flex-1 bg-app-background">
      {/* ================================= */}
      {/* LESSON */}
      {/* ================================= */}

      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4 pb-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <LessonMarkdown content={data.content_markdown} />
      </ScrollView>

      {/* ================================= */}
      {/* FIXED BOTTOM ACTION BAR */}
      {/* ================================= */}

      <SafeAreaView
        edges={["bottom"]}
        className="border-t border-border bg-app-background"
      >
        <View className="flex-row gap-1 px-4   pt-2">
          {/* QUIZ */}

          <View className="flex-1">
            <GameButton
              title="Quiz"
              variant="default"
              icon="school-outline"
              iconPosition="left"
              height={40}
              onPress={handleQuiz}
            />
          </View>

          {/* READ */}

          <View className="flex-1">
            <GameButton
              title={isRead ? "Marquer Non lue" : "Marquer lue"}
              variant={isRead ? "danger" : "success"}
              icon={
                isRead ? "close-circle-outline" : "checkmark-circle-outline"
              }
              iconPosition="left"
              height={40}
              onPress={handleToggleRead}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* ================================= */}
      {/* QUIZ */}
      {/* ================================= */}

      <LessonQuizSheet
        lesson={data}
        isOpen={showQuiz}
        onOpenChange={setShowQuiz}
        onFinished={returnToLessons}
      />
    </View>
  );
}
