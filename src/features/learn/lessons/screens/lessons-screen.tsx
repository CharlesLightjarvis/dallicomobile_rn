import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { EmptyCard, ErrorCard, LoadingCard } from "@/components/query-feedback";
import { ThreeDCard } from "@/components/ui/three-d-card";
import { useLessons } from "@/features/learn/lessons/hooks/use-lessons";

const LESSON_STYLES = [
  {
    icon: "book-outline" as const,
    colors: ["#243653", "#151F31"] as const,
  },
  {
    icon: "chatbubble-ellipses-outline" as const,
    colors: ["#31564F", "#19302C"] as const,
  },
  {
    icon: "language-outline" as const,
    colors: ["#644765", "#342536"] as const,
  },
  {
    icon: "ear-outline" as const,
    colors: ["#725033", "#3A281A"] as const,
  },
  {
    icon: "mic-outline" as const,
    colors: ["#405674", "#202C3D"] as const,
  },
  {
    icon: "sparkles-outline" as const,
    colors: ["#594672", "#2D243B"] as const,
  },
] as const;

export function LessonsScreen() {
  const { chapter = "" } = useLocalSearchParams<{
    chapter: string;
  }>();

  const { data, error, isPending, refetch } = useLessons(chapter);

  const totalLessons = data?.length ?? 0;

  const completedLessons =
    data?.filter((lesson) => (lesson.progress ?? 0) >= 100).length ?? 0;

  const globalProgress =
    totalLessons > 0
      ? Math.round(
          (data?.reduce((sum, lesson) => sum + (lesson.progress ?? 0), 0) ??
            0) / totalLessons,
        )
      : 0;

  const openLesson = (slug: string, lessonTitle: string) => {
    router.push({
      pathname: "/learn/lessons/[lesson]",
      params: {
        lesson: slug,
        title: lessonTitle,
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
            Continuez votre apprentissage
          </Text>

          <Text className="max-w-[92%] text-sm leading-5 text-muted">
            Choisissez une leçon et avancez à votre rythme.
          </Text>
        </View>
      </View>

      {/* STATES */}
      {isPending ? (
        <LoadingCard label="Chargement des leçons…" />
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
                  Leçons
                </Text>

                <Text className="text-xl font-bold text-foreground">
                  {totalLessons}
                </Text>

                <Text className="text-[9px] text-muted">disponibles</Text>
              </View>

              <View className="h-10 w-px bg-separator" />

              {/* COMPLETED */}
              <View className="flex-1 items-center gap-1">
                <Text className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Terminées
                </Text>

                <Text className="text-xl font-bold text-foreground">
                  {completedLessons}

                  <Text className="text-xs font-medium text-muted">
                    /{totalLessons}
                  </Text>
                </Text>

                <Text className="text-[9px] text-muted">complétées</Text>
              </View>

              <View className="h-10 w-px bg-separator" />

              {/* PROGRESS */}
              <View className="flex-1 items-center gap-1">
                <Text className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Progression
                </Text>

                <Text className="text-xl font-bold text-accent">
                  {globalProgress}%
                </Text>

                <Text className="text-[9px] text-muted">du chapitre</Text>
              </View>
            </View>
          </ThreeDCard>

          {/* ============================== */}
          {/* LESSON CARDS */}
          {/* ============================== */}

          <View className="gap-3">
            {data.map((lesson, index) => {
              const visual = LESSON_STYLES[index % LESSON_STYLES.length];

              const lessonNumber = String(index + 1).padStart(2, "0");

              const progress = Math.min(Math.max(lesson.progress ?? 0, 0), 100);

              const isCompleted = progress >= 100;

              const isStarted = progress > 0 && progress < 100;

              return (
                <ThreeDCard
                  key={lesson.slug}
                  onPress={() => openLesson(lesson.slug, lesson.title)}
                  depth={6}
                  pressDepth={3}
                  radius={2}
                  containerClassName="w-full"
                  className="h-44 w-full overflow-hidden p-0"
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
                            LEÇON
                          </Text>

                          <Text className="text-[10px] font-bold text-white">
                            {lessonNumber}
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
                          {lessonNumber}
                        </Text>

                        <View className="min-w-0 flex-1 gap-1 pb-1">
                          <Text
                            className="text-xl font-bold leading-6 text-white"
                            numberOfLines={2}
                          >
                            {lesson.title}
                          </Text>

                          <Text
                            className="text-xs leading-4 text-white/65"
                            numberOfLines={2}
                          >
                            {lesson.subtitle}
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
                                  : "OUVRIR LA LEÇON"}
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
        <EmptyCard message="Aucune leçon disponible." />
      )}
    </ScrollView>
  );
}
