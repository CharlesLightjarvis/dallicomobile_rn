import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { EmptyCard, ErrorCard, LoadingCard } from "@/components/query-feedback";
import { LessonOverviewCard } from "@/features/lessons/components/lesson-overview-card";
import { useLessons } from "@/features/lessons/hooks/use-lessons";

export function LessonsScreen() {
  const { chapter = "" } = useLocalSearchParams<{ chapter: string }>();
  const { data, error, isPending, refetch } = useLessons(chapter);

  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-5 px-4 pb-16 pt-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="text-2xl font-semibold text-foreground">Leçons</Text>

      {isPending ? (
        <LoadingCard label="Chargement des leçons…" />
      ) : error ? (
        <ErrorCard message={error.message} onRetry={() => void refetch()} />
      ) : data?.length ? (
        <View className="gap-4">
          {data.map((lesson) => (
            <LessonOverviewCard key={lesson.slug} lesson={lesson} />
          ))}
        </View>
      ) : (
        <EmptyCard message="Aucune leçon disponible." />
      )}
    </ScrollView>
  );
}
