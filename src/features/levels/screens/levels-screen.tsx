import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyCard, ErrorCard, LoadingCard } from "@/components/query-feedback";
import { ThreeDCard } from "@/components/ui/three-d-card";
import { useLevels } from "@/features/levels/hooks/use-levels";
import type { Level } from "@/features/levels/types/level";

type LevelWithChapters = Level & {
  chapters_count?: number;
  completed_chapters_count?: number;
};

const CARD_RADIUS = 2;

const CARD_DEPTH = 6;
const CARD_PRESS_DEPTH = 3;

const LEVEL_META = {
  A1: {
    rank: "INITIATION",
    name: "Premiers pas",
    icon: "sparkles-outline" as const,

    colors: ["#273469", "#111827"] as const,
    depth: "#0A1020",
  },

  A2: {
    rank: "EXPLORATION",
    name: "Fondations",
    icon: "compass-outline" as const,

    colors: ["#534AB7", "#25204F"] as const,
    depth: "#17132F",
  },

  B1: {
    rank: "AUTONOMIE",
    name: "Voyageur",
    icon: "navigate-outline" as const,

    colors: ["#176B87", "#123047"] as const,
    depth: "#091E2B",
  },

  B2: {
    rank: "MAÎTRISE",
    name: "Stratège",
    icon: "flash-outline" as const,

    colors: ["#A65327", "#442413"] as const,
    depth: "#29150B",
  },

  C1: {
    rank: "EXPERTISE",
    name: "Élite",
    icon: "diamond-outline" as const,

    colors: ["#763A69", "#351B31"] as const,
    depth: "#21101E",
  },

  C2: {
    rank: "EXCELLENCE",
    name: "Maître",
    icon: "trophy-outline" as const,

    colors: ["#665111", "#29230F"] as const,
    depth: "#191506",
  },
} as const;

export function LevelsScreen() {
  const { data, error, isPending, refetch } = useLevels();

  const { width } = useWindowDimensions();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const horizontalRef = useRef<ScrollView>(null);

  const horizontalPadding = 16;
  const cardGap = 12;

  const cardWidth = Math.min(width - horizontalPadding * 2 - 32, 420);

  const cardHeight = 310;

  const snapInterval = cardWidth + cardGap;

  const selectedLevel = data?.[selectedIndex] as LevelWithChapters | undefined;

  const openLevel = (level: Level) => {
    router.push({
      pathname: "/learn/levels/[level]",
      params: {
        level: level.code,
        title: level.title,
      },
    });
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!data?.length) return;

    const offsetX = event.nativeEvent.contentOffset.x;

    const nextIndex = Math.round(offsetX / snapInterval);

    setSelectedIndex(Math.max(0, Math.min(nextIndex, data.length - 1)));
  };

  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="gap-6 pb-24"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <View className="gap-2 px-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="min-w-0 flex-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              Choisissez un niveau
            </Text>
          </View>

          {data?.length ? (
            /*
             * PETIT COMPTEUR 3D
             */
            <View
              style={{
                position: "relative",
                paddingBottom: 3,
              }}
            >
              <View
                className="absolute inset-x-0 top-[3px] h-full bg-surface-secondary"
                style={{
                  borderRadius: CARD_RADIUS,
                }}
              />

              <View
                className="bg-surface px-2.5 py-1.5"
                style={{
                  borderRadius: CARD_RADIUS,
                }}
              >
                <Text className="text-[10px] font-bold tracking-wider text-muted">
                  {String(selectedIndex + 1).padStart(2, "0")}
                  {" / "}
                  {String(data.length).padStart(2, "0")}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <Text className="max-w-[90%] text-sm leading-5 text-muted">
          Sélectionnez votre niveau et poursuivez votre progression.
        </Text>
      </View>

      {/* ============================== */}
      {/* QUERY STATES */}
      {/* ============================== */}

      {isPending ? (
        <View className="px-4">
          <LoadingCard label="Chargement des niveaux…" />
        </View>
      ) : error ? (
        <View className="px-4">
          <ErrorCard message={error.message} onRetry={() => void refetch()} />
        </View>
      ) : data?.length && selectedLevel ? (
        <>
          {/* STATISTIQUES */}
          <View className="px-4">
            <ThreeDCard className="border border-border bg-surface p-3">
              <View className="flex-row items-center">
                {/* CHAPITRES */}

                <View className="flex-1 items-center gap-1">
                  <Text
                    className="text-[9px] font-bold uppercase tracking-wider text-muted"
                    numberOfLines={1}
                  >
                    Chapitres
                  </Text>

                  <Text className="text-xl font-bold text-foreground">
                    {selectedLevel.completed_chapters_count ?? "—"}

                    {selectedLevel.chapters_count !== undefined ? (
                      <Text className="text-xs font-medium text-muted">
                        /{selectedLevel.chapters_count}
                      </Text>
                    ) : null}
                  </Text>

                  <Text className="text-[9px] text-muted">terminés</Text>
                </View>

                <View className="h-10 w-px bg-separator" />

                {/* LEÇONS */}

                <View className="flex-1 items-center gap-1">
                  <Text
                    className="text-[9px] font-bold uppercase tracking-wider text-muted"
                    numberOfLines={1}
                  >
                    Leçons
                  </Text>

                  <Text className="text-xl font-bold text-foreground">
                    {selectedLevel.completed_lessons_count}

                    <Text className="text-xs font-medium text-muted">
                      /{selectedLevel.lessons_count}
                    </Text>
                  </Text>

                  <Text className="text-[9px] text-muted">terminées</Text>
                </View>

                <View className="h-10 w-px bg-separator" />

                {/* PROGRESSION */}

                <View className="flex-1 items-center gap-1">
                  <Text
                    className="text-[9px] font-bold uppercase tracking-wider text-muted"
                    numberOfLines={1}
                  >
                    Progression
                  </Text>

                  <Text className="text-xl font-bold text-accent">
                    {selectedLevel.progress}%
                  </Text>

                  <Text className="text-[9px] text-muted">du niveau</Text>
                </View>
              </View>
            </ThreeDCard>
          </View>

          {/* ============================== */}
          {/* INFOS + CAROUSEL */}
          {/* ============================== */}

          <View className="gap-2">
            {/* INFOS NIVEAU */}

            <View
              style={{
                width: cardWidth,
                marginLeft: horizontalPadding,
              }}
            >
              <Text
                className="text-sm font-semibold text-foreground"
                numberOfLines={1}
              >
                {selectedLevel.title}
              </Text>

              <Text className="text-xs leading-5 text-muted" numberOfLines={2}>
                {selectedLevel.description}
              </Text>
            </View>

            {/* ============================== */}
            {/* CAROUSEL */}
            {/* ============================== */}

            <ScrollView
              ref={horizontalRef}
              horizontal
              decelerationRate="fast"
              snapToInterval={snapInterval}
              snapToAlignment="start"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: cardGap,
                paddingHorizontal: horizontalPadding,

                // profondeur 3D
                paddingBottom: CARD_DEPTH,
              }}
              onMomentumScrollEnd={handleScrollEnd}
            >
              {data.map((level) => {
                const code = level.code.toUpperCase();

                const meta =
                  LEVEL_META[code as keyof typeof LEVEL_META] ?? LEVEL_META.A1;

                const isCompleted = level.status === "completed";

                const isInProgress = level.status === "in_progress";

                return (
                  <ThreeDCard
                    key={level.code}
                    onPress={() => openLevel(level)}
                    className="overflow-hidden p-0"
                    style={{
                      width: cardWidth,
                      height: 310,
                    }}
                    containerStyle={{
                      width: cardWidth,
                    }}
                  >
                    <LinearGradient
                      colors={meta.colors}
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

                      <View className="absolute -right-16 -top-20 size-56 rounded-full bg-white/5" />

                      <View className="absolute -bottom-24 -left-12 size-52 rounded-full border border-white/10" />

                      <View className="absolute right-10 top-20 size-20 rounded-full border border-white/5" />

                      <View className="flex-1 justify-between p-5">
                        {/* CARD TOP */}

                        <View className="flex-row items-start justify-between">
                          <View className="size-12 items-center justify-center rounded-2xl bg-white/10">
                            <Ionicons
                              name={meta.icon}
                              size={25}
                              color="white"
                            />
                          </View>

                          <View className="items-end gap-2">
                            {isCompleted ? (
                              <View className="flex-row items-center gap-1.5">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={16}
                                  color="white"
                                />

                                <Text className="text-[10px] font-bold tracking-wider text-white/80">
                                  TERMINÉ
                                </Text>
                              </View>
                            ) : isInProgress ? (
                              <View className="flex-row items-center gap-1.5">
                                <View className="size-1.5 rounded-full bg-white" />

                                <Text className="text-[10px] font-bold tracking-wider text-white/80">
                                  EN COURS
                                </Text>
                              </View>
                            ) : null}

                            <Ionicons
                              name="arrow-forward"
                              size={18}
                              color="rgba(255,255,255,0.55)"
                            />
                          </View>
                        </View>

                        {/* LEVEL */}

                        <View className="items-center">
                          <Text className="text-[10px] font-bold tracking-[3px] text-white/55">
                            {meta.rank}
                          </Text>

                          <Text className="mt-1 text-[72px] font-bold leading-[78px] tracking-tight text-white">
                            {level.code}
                          </Text>

                          <Text className="text-base font-semibold text-white/70">
                            {meta.name}
                          </Text>
                        </View>

                        {/* PROGRESS */}

                        <View className="gap-2">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs font-medium text-white/60">
                              Progression
                            </Text>

                            <Text className="text-xs font-bold text-white">
                              {level.progress}%
                            </Text>
                          </View>

                          <View className="h-1.5 overflow-hidden rounded-full bg-white/15">
                            <View
                              className="h-full rounded-full bg-white"
                              style={{
                                width: `${Math.min(
                                  Math.max(level.progress, 0),
                                  100,
                                )}%`,
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </ThreeDCard>
                );
              })}
            </ScrollView>
          </View>
        </>
      ) : (
        <View className="px-4">
          <EmptyCard message="Aucun niveau disponible." />
        </View>
      )}
    </ScrollView>
  );
}
