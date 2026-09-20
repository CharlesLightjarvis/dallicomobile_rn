import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { EmptyCard, ErrorCard, LoadingCard } from "@/components/query-feedback";
import { ThreeDCard } from "@/components/ui/three-d-card";
import { useChapters } from "@/features/chapters/hooks/use-chapters";

const CHAPTER_STYLES = [
  {
    icon: "chatbubbles-outline" as const,
    colors: ["#283B63", "#182238"] as const,
  },
  {
    icon: "compass-outline" as const,
    colors: ["#315C55", "#19332F"] as const,
  },
  {
    icon: "people-outline" as const,
    colors: ["#68436A", "#352236"] as const,
  },
  {
    icon: "storefront-outline" as const,
    colors: ["#765032", "#3C291A"] as const,
  },
  {
    icon: "train-outline" as const,
    colors: ["#3F5275", "#202B40"] as const,
  },
  {
    icon: "sparkles-outline" as const,
    colors: ["#5E4A79", "#30263E"] as const,
  },
] as const;

export function ChaptersScreen() {
  const { level = "" } = useLocalSearchParams<{
    level: string;
  }>();

  const { data, error, isPending, refetch } = useChapters(level);

  const totalChapters = data?.length ?? 0;

  const completedChapters =
    data?.filter((chapter) => (chapter.progress ?? 0) >= 100).length ?? 0;

  const globalProgress =
    totalChapters > 0
      ? Math.round(
          (data?.reduce(
            (total, chapter) => total + (chapter.progress ?? 0),
            0,
          ) ?? 0) / totalChapters,
        )
      : 0;

  const openChapter = (slug: string, title: string) => {
    router.push({
      pathname: "/learn/chapters/[chapter]",
      params: {
        chapter: slug,
        title,
      },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View className="gap-3">
        <View className="gap-1">
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Que voulez-vous explorer ?
          </Text>

          <Text className="max-w-[92%] text-sm leading-5 text-muted">
            Ouvrez un chapitre et entrez directement dans son univers.
          </Text>
        </View>
      </View>

      {/* QUERY STATES */}
      {isPending ? (
        <LoadingCard label="Chargement des chapitres…" />
      ) : error ? (
        <ErrorCard message={error.message} onRetry={() => void refetch()} />
      ) : data?.length ? (
        <>
          {/* ============================== */}
          {/* STATS */}
          {/* ============================== */}

          <ThreeDCard
            depth={6}
            radius={2}
            containerClassName="w-full"
            className="w-full border border-border bg-surface p-3"
          >
            <View className="flex-row items-center">
              {/* TOTAL */}

              <View className="flex-1 items-center gap-1">
                <Text className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Chapitres
                </Text>

                <Text className="text-xl font-bold text-foreground">
                  {totalChapters}
                </Text>

                <Text className="text-[9px] text-muted">disponibles</Text>
              </View>

              <View className="h-10 w-px bg-separator" />

              {/* TERMINÉS */}

              <View className="flex-1 items-center gap-1">
                <Text className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Terminés
                </Text>

                <Text className="text-xl font-bold text-foreground">
                  {completedChapters}

                  <Text className="text-xs font-medium text-muted">
                    /{totalChapters}
                  </Text>
                </Text>

                <Text className="text-[9px] text-muted">complétés</Text>
              </View>

              <View className="h-10 w-px bg-separator" />

              {/* PROGRESSION */}

              <View className="flex-1 items-center gap-1">
                <Text className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Progression
                </Text>

                <Text className="text-xl font-bold text-accent">
                  {globalProgress}%
                </Text>

                <Text className="text-[9px] text-muted">du niveau</Text>
              </View>
            </View>
          </ThreeDCard>

          {/* ============================== */}
          {/* CHAPTER CARDS */}
          {/* ============================== */}

          <View className="gap-3">
            {data.map((chapter, index) => {
              const visual = CHAPTER_STYLES[index % CHAPTER_STYLES.length];

              const chapterNumber = String(index + 1).padStart(2, "0");

              const progress = Math.min(
                Math.max(chapter.progress ?? 0, 0),
                100,
              );

              const isCompleted = progress >= 100;

              const isStarted = progress > 0 && progress < 100;

              return (
                <ThreeDCard
                  key={chapter.slug}
                  onPress={() => openChapter(chapter.slug, chapter.title)}
                  depth={6}
                  pressDepth={3}
                  radius={2}
                  containerClassName="w-full"
                  className="h-46 w-full overflow-hidden p-0"
                >
                  <LinearGradient
                    colors={visual.colors}
                    start={{
                      x: 0,
                      y: 0,
                    }}
                    end={{
                      x: 1,
                      y: 1,
                    }}
                    style={{
                      flex: 1,
                    }}
                  >
                    {/* DECOR */}

                    <View className="absolute -right-14 -top-16 size-40 rounded-full border border-white/10" />

                    <View className="absolute -bottom-16 right-12 size-28 rounded-full bg-white/5" />

                    {/* CARD */}

                    <View className="h-44 justify-between p-4">
                      {/* TOP */}

                      <View className="flex-row items-start justify-between">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-[10px] font-bold tracking-[2px] text-white/55">
                            CHAPTER
                          </Text>

                          <Text className="text-[10px] font-bold text-white">
                            {chapterNumber}
                          </Text>
                        </View>

                        <View className="size-9 items-center justify-center rounded-xl bg-white/10">
                          <Ionicons
                            name={visual.icon}
                            size={19}
                            color="white"
                          />
                        </View>
                      </View>

                      {/* CONTENT */}

                      <View className="flex-row items-end gap-4">
                        <Text className="text-[54px] font-bold leading-14.5 text-white/15">
                          {chapterNumber}
                        </Text>

                        <View className="min-w-0 flex-1 gap-1 pb-1">
                          <Text
                            className="text-xl font-bold leading-6 text-white"
                            numberOfLines={2}
                          >
                            {chapter.title}
                          </Text>

                          <Text
                            className="text-xs leading-4 text-white/65"
                            numberOfLines={2}
                          >
                            {chapter.description}
                          </Text>
                        </View>
                      </View>

                      {/* BOTTOM */}

                      <View className="gap-1">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-1.5">
                            {isCompleted ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={13}
                                color="rgba(255,255,255,0.65)"
                              />
                            ) : isStarted ? (
                              <View className="size-1.5 rounded-full bg-white/70" />
                            ) : null}

                            <Text className="text-[10px] font-semibold tracking-wider text-white/45">
                              {isCompleted
                                ? "TERMINÉ"
                                : isStarted
                                  ? "CONTINUER"
                                  : "OUVRIR LE CHAPITRE"}
                            </Text>
                          </View>

                          <View className="size-8 items-center justify-center rounded-full bg-white">
                            <Ionicons
                              name={
                                isCompleted
                                  ? "refresh-outline"
                                  : "arrow-forward"
                              }
                              size={16}
                              color="#171717"
                            />
                          </View>
                        </View>

                        {/* PROGRESSION */}

                        <View className="gap-1">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-[9px] font-medium text-white/55">
                              Progression
                            </Text>

                            <Text className="text-[9px] font-bold text-white/55">
                              {progress}%
                            </Text>
                          </View>

                          <View className="h-1 overflow-hidden rounded-full bg-white/15">
                            <View
                              className="h-full rounded-full bg-white"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </ThreeDCard>
              );
            })}
          </View>
        </>
      ) : (
        <EmptyCard message="Aucun chapitre disponible." />
      )}
    </ScrollView>
  );
}
