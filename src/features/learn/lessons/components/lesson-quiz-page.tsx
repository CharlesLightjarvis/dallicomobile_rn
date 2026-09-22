import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { useState } from "react";
import {
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameButton } from "@/components/ui/game-button";
import { ThreeDQuizChoiceCard } from "@/components/ui/three-d-quiz-choice-card";

import type { NextLesson } from "@/features/progress/types/progress";
import {
  useCompleteLesson,
  useSubmitExercise,
} from "../hooks/use-lesson-progress";
import type { Lesson } from "../types/lesson";

/* =========================================================
 * TYPES
 * ======================================================= */

type Feedback = {
  correct: boolean;
  text: string;
  correctAnswer?: string;
};

type QuizChoiceState = "idle" | "selected" | "correct" | "incorrect";

type LessonQuizPageProps = {
  lesson: Lesson;

  onFinished: (result: LessonQuizFinishedResult) => void;
};

export type LessonQuizFinishedResult = {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  nextLesson: NextLesson | null;
};

/* =========================================================
 * CONSTANTS
 * ======================================================= */

const LETTERS = ["A", "B", "C", "D"];

const QUIZ_IMAGES = [
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
];

/* =========================================================
 * HELPERS
 * ======================================================= */

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase();
}

function resolveOption(
  candidate: unknown,
  options: readonly string[],
): string | undefined {
  if (typeof candidate === "string") {
    const normalized = normalizeAnswer(candidate);

    /* A / B / C / D */

    const letterIndex = LETTERS.findIndex(
      (letter) => letter.toLowerCase() === normalized,
    );

    if (letterIndex >= 0 && options[letterIndex]) {
      return options[letterIndex];
    }

    /* texte exact */

    const matchingOption = options.find(
      (option) => normalizeAnswer(option) === normalized,
    );

    if (matchingOption) {
      return matchingOption;
    }

    /* index string */

    const numeric = Number(candidate);

    if (Number.isInteger(numeric) && numeric >= 0 && numeric < options.length) {
      return options[numeric];
    }
  }

  /* index number */

  if (
    typeof candidate === "number" &&
    Number.isInteger(candidate) &&
    candidate >= 0 &&
    candidate < options.length
  ) {
    return options[candidate];
  }

  return undefined;
}

function getCorrectAnswer(
  result: unknown,
  exercise: unknown,
): string | undefined {
  const resultData =
    result && typeof result === "object"
      ? (result as Record<string, unknown>)
      : {};

  const exerciseData =
    exercise && typeof exercise === "object"
      ? (exercise as Record<string, unknown>)
      : {};

  const options = Array.isArray(exerciseData.options)
    ? exerciseData.options.filter(
        (option): option is string => typeof option === "string",
      )
    : [];

  const candidates = [
    resultData.correct_answer,
    resultData.correctAnswer,
    resultData.correct_option,
    resultData.correctOption,
    resultData.expected_answer,
    resultData.expectedAnswer,
    resultData.answer,
    resultData.solution,

    exerciseData.correct_answer,
    exerciseData.correctAnswer,
    exerciseData.correct_option,
    exerciseData.correctOption,
    exerciseData.expected_answer,
    exerciseData.expectedAnswer,
    exerciseData.answer,
    exerciseData.solution,
  ];

  for (const candidate of candidates) {
    const resolved = resolveOption(candidate, options);

    if (resolved) {
      return resolved;
    }
  }

  const nestedCandidates = [
    resultData.exercise,
    resultData.data,
    resultData.result,
  ];

  for (const nested of nestedCandidates) {
    if (!nested || typeof nested !== "object") {
      continue;
    }

    const object = nested as Record<string, unknown>;

    const nestedValues = [
      object.correct_answer,
      object.correctAnswer,
      object.correct_option,
      object.correctOption,
      object.expected_answer,
      object.expectedAnswer,
      object.answer,
      object.solution,
    ];

    for (const candidate of nestedValues) {
      const resolved = resolveOption(candidate, options);

      if (resolved) {
        return resolved;
      }
    }
  }

  return undefined;
}

function getExerciseImage(exercise: unknown, questionIndex: number) {
  if (exercise && typeof exercise === "object") {
    const data = exercise as Record<string, unknown>;

    const candidate =
      data.image_url ??
      data.imageUrl ??
      data.image ??
      data.media_url ??
      data.mediaUrl;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return QUIZ_IMAGES[questionIndex % QUIZ_IMAGES.length] ?? QUIZ_IMAGES[0];
}

/* =========================================================
 * COMPONENT
 * ======================================================= */

export function LessonQuizPage({ lesson, onFinished }: LessonQuizPageProps) {
  const insets = useSafeAreaInsets();

  const { height: screenHeight } = useWindowDimensions();

  /*
   * Aucun de ces calculs
   * ne dépend du feedback.
   */

  const imageHeight = clamp(Math.round(screenHeight * 0.18), 120, 160);

  const feedbackAreaHeight = clamp(Math.round(screenHeight * 0.17), 138, 154);

  /* =======================================================
   * STATE
   * ===================================================== */

  const [questionIndex, setQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] = useState<Feedback | undefined>();

  const [correctAnswers, setCorrectAnswers] = useState(0);

  /*
   * SHEET DE SORTIE
   */
  const [showExitSheet, setShowExitSheet] = useState(false);

  /* =======================================================
   * API
   * ===================================================== */

  const submit = useSubmitExercise(lesson.slug);

  const complete = useCompleteLesson(lesson.slug);

  /* =======================================================
   * CURRENT QUESTION
   * ===================================================== */

  const exercise = lesson.exercises[questionIndex];

  const totalQuestions = lesson.exercises.length;

  const isLastQuestion = questionIndex === totalQuestions - 1;

  const questionImage = getExerciseImage(exercise, questionIndex);

  /* =======================================================
   * RESET
   * ===================================================== */

  const resetQuestion = () => {
    setAnswer("");

    setFeedback(undefined);

    submit.reset();
  };

  /* =======================================================
   * VALIDATE
   * ===================================================== */

  const validateAnswer = async () => {
    if (!exercise || !answer.trim() || submit.isPending) {
      return;
    }

    try {
      const result = await submit.mutateAsync({
        exercise: exercise.id,

        answer,
      });

      const text =
        result.explanation ??
        (result.is_correct
          ? "Très bien !"
          : "Cette notion mérite encore un peu de révision.");

      const correctAnswer = getCorrectAnswer(result, exercise);

      setFeedback({
        correct: result.is_correct,

        text,

        correctAnswer,
      });

      if (result.is_correct) {
        setCorrectAnswers((current) => current + 1);
      }
    } catch {
      /*
       * submit.error
       * affiché dans l'écran.
       */
    }
  };

  /* =======================================================
   * NEXT
   * ===================================================== */

  const goToNextQuestion = () => {
    if (isLastQuestion) {
      return;
    }

    setQuestionIndex((current) => current + 1);

    resetQuestion();
  };

  /* =======================================================
   * FINISH
   * ===================================================== */

  const finishQuiz = async () => {
    try {
      const result = await complete.mutateAsync();

      onFinished({
        correctAnswers,

        totalQuestions,

        score: result.score,

        nextLesson: result.next_lesson,
      });
    } catch {
      /*
       * complete.error
       * affiché dans l'écran.
       */
    }
  };

  /* =======================================================
   * CHOICE STATE
   * ===================================================== */

  const getChoiceState = (option: string): QuizChoiceState => {
    if (!feedback) {
      return answer === option ? "selected" : "idle";
    }

    if (
      feedback.correctAnswer &&
      normalizeAnswer(feedback.correctAnswer) === normalizeAnswer(option)
    ) {
      return "correct";
    }

    if (feedback.correct && answer === option) {
      return "correct";
    }

    if (!feedback.correct && answer === option) {
      return "incorrect";
    }

    return "idle";
  };

  /* =======================================================
   * EMPTY
   * ===================================================== */

  if (!exercise) {
    return (
      <View className="flex-1 bg-app-background">
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View
          className="flex-1 items-center justify-center gap-3 px-4"
          style={{
            paddingTop: insets.top,

            paddingBottom: insets.bottom,
          }}
        >
          <View className="size-14 items-center justify-center rounded-full bg-surface-secondary">
            <Ionicons name="school-outline" size={26} color="#777" />
          </View>

          <Text className="text-lg font-bold text-foreground">Aucun quiz</Text>

          <Text className="text-center text-sm text-muted">
            Cette leçon ne contient pas encore de question.
          </Text>
        </View>
      </View>
    );
  }

  /* =======================================================
   * RENDER
   * ===================================================== */

  return (
    <View className="flex-1 bg-app-background">
      {/* =============================================== */}
      {/* ROUTER HEADER OFF */}
      {/* =============================================== */}

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* =============================================== */}
      {/* TOP SAFE AREA */}
      {/* =============================================== */}

      <View
        style={{
          height: insets.top,
        }}
      />

      {/* =============================================== */}
      {/* HEADER */}
      {/* =============================================== */}

      <View className="flex-row items-center justify-between px-2 pb-2">
        <Text className="text-base font-bold text-foreground">
          {questionIndex + 1}/{totalQuestions}
        </Text>

        <Pressable
          accessibilityLabel="Fermer le quiz"
          accessibilityRole="button"
          className="size-9 items-center justify-center rounded-full bg-surface-secondary"
          onPress={() => setShowExitSheet(true)}
        >
          <Ionicons name="close" size={21} color="#777" />
        </Pressable>
      </View>

      {/* =============================================== */}
      {/* PROGRESS */}
      {/* =============================================== */}

      <View className="px-2 pb-2">
        <View className="flex-row gap-1">
          {lesson.exercises.map((question, index) => {
            const active = index <= questionIndex;

            return (
              <View
                key={question.id}
                className={`h-2 flex-1 ${
                  active ? "bg-accent" : "bg-surface-tertiary"
                }`}
                style={{
                  borderRadius: 999,
                }}
              />
            );
          })}
        </View>
      </View>

      {/* =============================================== */}
      {/* IMAGE */}
      {/* =============================================== */}

      <View className="px-2">
        <Image
          source={{
            uri: questionImage,
          }}
          resizeMode="cover"
          style={{
            width: "100%",

            height: imageHeight,

            borderRadius: 8,
          }}
        />
      </View>

      {/* =============================================== */}
      {/* QUESTION + ANSWERS */}
      {/* =============================================== */}

      <View className="flex-1 justify-center gap-4 px-2">
        {/* QUESTION */}

        <View className="items-center gap-1">
          <Text className="text-center text-[10px] font-bold uppercase tracking-[2px] text-muted">
            Question {questionIndex + 1}
          </Text>

          <Text
            className="text-center text-xl font-bold leading-7 text-foreground"
            numberOfLines={3}
          >
            {exercise.question}
          </Text>
        </View>

        {/* ============================================= */}
        {/* ANSWERS */}
        {/* ============================================= */}

        {exercise.options?.length ? (
          <View className="flex-row flex-wrap gap-1">
            {exercise.options.map((option, index) => {
              const state = getChoiceState(option);

              return (
                <View key={option} className="w-[49%]">
                  <ThreeDQuizChoiceCard
                    letter={LETTERS[index] ?? "?"}
                    label={option}
                    state={state}
                    disabled={Boolean(feedback) || submit.isPending}
                    onPress={() => setAnswer(option)}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <Text className="text-center text-sm text-muted">
            Cette question ne contient aucun choix de réponse.
          </Text>
        )}

        {/* ============================================= */}
        {/* SUBMIT ERROR */}
        {/* ============================================= */}

        {submit.error ? (
          <Text className="text-center text-xs text-danger" numberOfLines={2}>
            {submit.error.message}
          </Text>
        ) : null}
      </View>

      {/* =============================================== */}
      {/* BOTTOM RESERVED AREA */}
      {/* =============================================== */}

      <View
        className={
          feedback
            ? feedback.correct
              ? "bg-success-soft"
              : "bg-danger-soft"
            : "bg-app-background"
        }
        style={{
          height: feedbackAreaHeight + insets.bottom,

          paddingBottom: insets.bottom,
        }}
      >
        {!feedback ? (
          /* =========================================== */
          /* VALIDATE */
          /* =========================================== */

          <View className="flex-1 justify-end px-2">
            <GameButton
              title={submit.isPending ? "Validation…" : "Valider"}
              variant={answer.trim() ? "accent" : "default"}
              icon="checkmark"
              iconPosition="right"
              height={40}
              onPress={() => void validateAnswer()}
              disabled={!answer.trim() || submit.isPending}
              loading={submit.isPending}
            />
          </View>
        ) : (
          /* =========================================== */
          /* FEEDBACK */
          /* =========================================== */

          <View className="flex-1 justify-between gap-2 px-3 pt-3">
            {/* TEXT */}

            <View className="flex-row items-start gap-2">
              {/* ICON */}

              <View
                className={
                  feedback.correct
                    ? "size-9 items-center justify-center bg-success"
                    : "size-9 items-center justify-center bg-danger"
                }
                style={{
                  borderRadius: 999,
                }}
              >
                <Ionicons
                  name={feedback.correct ? "checkmark" : "close"}
                  size={20}
                  color="white"
                />
              </View>

              {/* COPY */}

              <View className="min-w-0 flex-1">
                <Text
                  className={
                    feedback.correct
                      ? "text-base font-bold text-success"
                      : "text-base font-bold text-danger"
                  }
                >
                  {feedback.correct ? "Bonne réponse !" : "Réponse incorrecte"}
                </Text>

                {!feedback.correct && feedback.correctAnswer ? (
                  <Text
                    className="mt-0.5 text-xs font-semibold text-danger"
                    numberOfLines={1}
                  >
                    Bonne réponse : {feedback.correctAnswer}
                  </Text>
                ) : null}

                <Text
                  className="mt-1 text-xs leading-4 text-foreground"
                  numberOfLines={2}
                >
                  {feedback.text}
                </Text>
              </View>
            </View>

            {/* ========================================= */}
            {/* CONTINUE */}
            {/* ========================================= */}

            <GameButton
              title={isLastQuestion ? "Terminer" : "Continuer"}
              variant={feedback.correct ? "success" : "danger"}
              icon={
                isLastQuestion ? "checkmark-circle-outline" : "arrow-forward"
              }
              iconPosition="right"
              height={40}
              onPress={() =>
                void (isLastQuestion ? finishQuiz() : goToNextQuestion())
              }
              loading={complete.isPending}
              loadingText="Enregistrement…"
            />
          </View>
        )}
      </View>

      {/* =============================================== */}
      {/* COMPLETE ERROR */}
      {/* =============================================== */}

      {complete.error ? (
        <View className="absolute bottom-0 left-0 right-0 px-2">
          <Text className="text-center text-xs text-danger" numberOfLines={1}>
            {complete.error.message}
          </Text>
        </View>
      ) : null}

      {/* =============================================== */}
      {/* EXIT BOTTOM SHEET */}
      {/* =============================================== */}

      <BottomSheet isOpen={showExitSheet} onOpenChange={setShowExitSheet}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay
            variant="blur"
            blurViewProps={{
              intensity: 35,
            }}
          />

          {/*
           * IMPORTANT :
           *
           * Pas de snapPoints.
           * Pas de h-full.
           * Pas de hauteur forcée.
           *
           * HeroUI mesure le contenu
           * et fait monter le sheet
           * à la bonne hauteur.
           */}

          <BottomSheet.Content backgroundClassName="bg-app-background">
            <View
              className="gap-4 px-4 pt-2"
              style={{
                paddingBottom: insets.bottom,
              }}
            >
              {/* ICON */}

              <View className="items-center">
                <View
                  className="size-14 items-center justify-center bg-danger-soft"
                  style={{
                    borderRadius: 999,
                  }}
                >
                  <Ionicons name="exit-outline" size={26} color="#EF4444" />
                </View>
              </View>

              {/* COPY */}

              <View className="items-center gap-1">
                <Text className="text-center text-xl font-bold text-foreground">
                  Quitter le quiz ?
                </Text>

                <Text className="text-center text-sm leading-5 text-muted">
                  Ta progression sur ce quiz sera perdue.
                </Text>
              </View>

              {/* ACTIONS */}

              <View className="gap-2">
                <GameButton
                  title="Continuer le quiz"
                  variant="accent"
                  icon="play"
                  iconPosition="right"
                  height={44}
                  onPress={() => setShowExitSheet(false)}
                />

                <GameButton
                  title="Quitter le quiz"
                  variant="danger"
                  icon="exit-outline"
                  iconPosition="right"
                  height={44}
                  onPress={() => {
                    setShowExitSheet(false);

                    router.back();
                  }}
                />
              </View>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </View>
  );
}
