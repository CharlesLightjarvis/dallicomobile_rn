import { EmptyCard, ErrorCard, LoadingCard } from "@/components/query-feedback";
import { LevelOverviewCard } from "@/features/levels/components/level-overview-card";
import { useLevels } from "@/features/levels/hooks/use-levels";
import { ScrollView, Text, View } from "react-native";

export function LevelsScreen() {
  const { data, error, isPending, refetch } = useLevels();
  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-5 px-4 pt-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="gap-2">
        <Text className="text-2xl font-bold text-foreground">
          Votre parcours allemand
        </Text>
        <Text className="text-sm text-muted">Avancez niveau après niveau.</Text>
      </View>
      {isPending ? (
        <LoadingCard label="Chargement des niveaux…" />
      ) : error ? (
        <ErrorCard message={error.message} onRetry={() => void refetch()} />
      ) : data?.length ? (
        <View className="gap-4">
          {data.map((level) => (
            <LevelOverviewCard key={level.code} level={level} />
          ))}
        </View>
      ) : (
        <EmptyCard message="Aucun niveau disponible." />
      )}
    </ScrollView>
  );
}
