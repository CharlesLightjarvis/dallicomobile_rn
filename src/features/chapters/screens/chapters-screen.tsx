import { EmptyCard, ErrorCard, LoadingCard } from "@/components/query-feedback";
import { ChapterOverviewCard } from "@/features/chapters/components/chapter-overview-card";
import { useChapters } from "@/features/chapters/hooks/use-chapters";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export function ChaptersScreen() {
  const { level = "" } = useLocalSearchParams<{ level: string }>();
  const { data, error, isPending, refetch } = useChapters(level);
  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-5 px-4 pb-24 pt-5"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="gap-2">
        <Text className="text-2xl font-bold text-foreground">
          Chapitres {level}
        </Text>
        <Text className="text-sm text-muted">
          Avance à ton rythme et commence par le chapitre de ton choix.
        </Text>
      </View>
      {isPending ? (
        <LoadingCard label="Chargement des chapitres…" />
      ) : error ? (
        <ErrorCard message={error.message} onRetry={() => void refetch()} />
      ) : data?.length ? (
        <View className="gap-4">
          {data.map((chapter) => (
            <ChapterOverviewCard key={chapter.slug} chapter={chapter} />
          ))}
        </View>
      ) : (
        <EmptyCard message="Aucun chapitre disponible." />
      )}
    </ScrollView>
  );
}
