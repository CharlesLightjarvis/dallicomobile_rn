import Ionicons from "@expo/vector-icons/Ionicons";
import {
  router,
  Stack,
  useNavigation,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback } from "react";
import { BackHandler, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameButton } from "@/components/ui/game-button";
import { ThreeDCard } from "@/components/ui/three-d-card";

type QuizSuccessParams = {
  lesson: string;
  title?: string;

  chapterSlug?: string;
  chapterTitle?: string;

  correctAnswers?: string;
  totalQuestions?: string;
  score?: string;

  nextLessonSlug?: string;
  nextLessonTitle?: string;
  nextChapterSlug?: string;
  nextLevel?: string;
};

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function QuizSuccessScreen() {
  const insets = useSafeAreaInsets();

  const { height: screenHeight } = useWindowDimensions();

  const params = useLocalSearchParams<QuizSuccessParams>();

  const navigation = useNavigation<{
    reset: (state: {
      index: number;
      routes: {
        name: string;
        params?: Record<string, string>;
      }[];
    }) => void;
  }>();

  /*
   * Layout adaptatif selon l'appareil,
   * mais JAMAIS scrollable.
   */
  const compact = screenHeight < 760;

  /*
   * Bloque le bouton Back Android.
   */
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

      return () => subscription.remove();
    }, []),
  );

  /*
   * RESULTS
   */
  const correctAnswers = parseNumber(params.correctAnswers, 0);

  const totalQuestions = parseNumber(params.totalQuestions, 0);

  const score = parseNumber(
    params.score,
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0,
  );

  const nextLessonSlug = params.nextLessonSlug ?? "";

  const returnToLessons = () => {
    router.dismissTo({
      pathname: "/learn/chapters/[chapter]",
      params: {
        chapter: params.chapterSlug ?? "",
        title: params.chapterTitle ?? "Chapitre",
      },
    });
  };

  /*
   * NEXT LESSON
   */
  const handleNextLesson = () => {
    if (!nextLessonSlug) {
      returnToLessons();

      return;
    }

    navigation.reset({
      index: 3,
      routes: [
        {
          name: "(tabs)",
        },
        {
          name: "learn/levels/[level]",
          params: {
            level: params.nextLevel ?? "",
            title: params.nextLevel
              ? `Niveau ${params.nextLevel.toUpperCase()}`
              : "Niveau",
          },
        },
        {
          name: "learn/chapters/[chapter]",
          params: {
            chapter: params.nextChapterSlug ?? params.chapterSlug ?? "",
            title: "Chapitre",
          },
        },
        {
          name: "learn/lessons/[lesson]",
          params: {
            lesson: nextLessonSlug,
            title: params.nextLessonTitle ?? "Leçon suivante",
          },
        },
      ],
    });
  };

  /*
   * RETRY
   */
  const handleRetry = () => {
    router.replace({
      pathname: "/learn/quiz/[lesson]",

      params: {
        lesson: params.lesson,

        title: params.title ?? "Leçon",
      },
    });
  };

  /*
   * LESSONS
   */
  const handleLessons = () => {
    returnToLessons();
  };

  return (
    <View className="flex-1 bg-app-background">
      {/* ================================= */}
      {/* NAVIGATION */}
      {/* ================================= */}

      <Stack.Screen
        options={{
          headerShown: false,

          /*
           * Pas de swipe back iOS.
           */
          gestureEnabled: false,
        }}
      />

      {/* ================================= */}
      {/* SAFE AREA PAGE */}
      {/* ================================= */}

      <View
        className="flex-1 px-5"
        style={{
          /*
           * Safe area appliquée
           * UNE seule fois.
           */
          paddingTop: insets.top + 6,

          paddingBottom: insets.bottom,
        }}
      >
        {/* ================================= */}
        {/* TOP CONTENT */}
        {/* ================================= */}

        <View className={compact ? "gap-2" : "gap-4"}>
          {/* ================================= */}
          {/* TITLE */}
          {/* ================================= */}

          <View
            className={compact ? "items-center gap-1" : "items-center gap-2"}
          >
            <Text className="text-xs font-bold uppercase tracking-[3px] text-accent">
              Quiz terminé
            </Text>

            <Text
              className={
                compact
                  ? "text-center text-2xl font-bold text-foreground"
                  : "text-center text-3xl font-bold text-foreground"
              }
              numberOfLines={1}
            >
              Super travail !
            </Text>

            <Text
              className={
                compact
                  ? "text-center text-sm leading-5 text-muted"
                  : "text-center text-base leading-6 text-muted"
              }
              numberOfLines={2}
            >
              Tu maîtrises cette leçon de mieux en mieux.
            </Text>
          </View>

          {/* ================================= */}
          {/* TROPHY */}
          {/* ================================= */}

          <View className={compact ? "items-center py-1" : "items-center py-2"}>
            {/* STAR LEFT */}

            <View
              className={
                compact ? "absolute left-12 top-2" : "absolute left-8 top-5"
              }
            >
              <Ionicons name="star" size={compact ? 18 : 22} color="#F4B942" />
            </View>

            {/* SPARKLE RIGHT */}

            <View
              className={
                compact ? "absolute right-12 top-8" : "absolute right-8 top-12"
              }
            >
              <Ionicons
                name="sparkles"
                size={compact ? 19 : 24}
                color="#E68A45"
              />
            </View>

            {/* STAR BOTTOM */}

            <View
              className={
                compact
                  ? "absolute bottom-0 left-16"
                  : "absolute bottom-3 left-14"
              }
            >
              <Ionicons
                name="star-outline"
                size={compact ? 17 : 20}
                color="#F4B942"
              />
            </View>

            {/* TROPHY CARD */}

            <ThreeDCard
              className={
                compact
                  ? "size-32 items-center justify-center rounded-[28px] border-0 bg-accent"
                  : "size-40 items-center justify-center rounded-[32px] border-0 bg-accent"
              }
              depthClassName={
                compact
                  ? "rounded-[28px] bg-card-depth"
                  : "rounded-[32px] bg-card-depth"
              }
              depth={compact ? 6 : 8}
              radius={compact ? 28 : 32}
            >
              <View
                className={
                  compact
                    ? "size-20 items-center justify-center rounded-full bg-white/20"
                    : "size-28 items-center justify-center rounded-full bg-white/20"
                }
              >
                <Ionicons
                  name="trophy"
                  size={compact ? 50 : 68}
                  color="#FFFFFF"
                />
              </View>
            </ThreeDCard>
          </View>

          {/* ================================= */}
          {/* STATS */}
          {/* ================================= */}

          <View className="flex-row gap-3">
            {/* CORRECT ANSWERS */}

            <ThreeDCard
              containerClassName="flex-1"
              className={
                compact
                  ? "w-full rounded-3xl border-border bg-surface px-3 py-3"
                  : "w-full rounded-3xl border-border bg-surface p-4"
              }
              depthClassName="rounded-3xl bg-card-depth"
              depth={compact ? 5 : 6}
              radius={24}
            >
              <Text
                className={
                  compact
                    ? "text-center text-xl font-bold text-accent"
                    : "text-center text-2xl font-bold text-accent"
                }
              >
                {correctAnswers}/{totalQuestions}
              </Text>

              <Text className="mt-1 text-center text-xs font-semibold text-muted">
                bonnes réponses
              </Text>
            </ThreeDCard>

            {/* SCORE */}

            <ThreeDCard
              containerClassName="flex-1"
              className={
                compact
                  ? "w-full rounded-3xl border-border bg-surface px-3 py-3"
                  : "w-full rounded-3xl border-border bg-surface p-4"
              }
              depthClassName="rounded-3xl bg-card-depth"
              depth={compact ? 5 : 6}
              radius={24}
            >
              <Text
                className={
                  compact
                    ? "text-center text-xl font-bold text-success"
                    : "text-center text-2xl font-bold text-success"
                }
              >
                {score}%
              </Text>

              <Text className="mt-1 text-center text-xs font-semibold text-muted">
                score
              </Text>
            </ThreeDCard>
          </View>
        </View>

        {/* ================================= */}
        {/* ACTIONS */}
        {/* Toujours poussées en bas */}
        {/* ================================= */}

        <View className={compact ? "mt-auto gap-2 pt-2" : "mt-auto gap-3 pt-4"}>
          {/* NEXT */}

          <GameButton
            title={nextLessonSlug ? "Leçon suivante" : "Retour aux chapitres"}
            variant="accent"
            icon="arrow-forward"
            iconPosition="right"
            height={compact ? 46 : 52}
            onPress={handleNextLesson}
          />

          {/* RETRY */}

          <GameButton
            title="Refaire le quiz"
            variant="default"
            icon="refresh"
            iconPosition="right"
            height={compact ? 46 : 52}
            onPress={handleRetry}
          />

          {/* LESSONS */}

          <GameButton
            title="Retour aux leçons"
            variant="default"
            icon="arrow-back"
            iconPosition="left"
            height={compact ? 46 : 52}
            onPress={handleLessons}
          />
        </View>
      </View>
    </View>
  );
}
