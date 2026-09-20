import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Toast, useToast } from "heroui-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import {
  useBottomSheetAwareHandlers,
  useThemeColor,
} from "heroui-native/hooks";
import { Input } from "heroui-native/input";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameButton } from "@/components/ui/game-button";
import { ThreeDQuizChoiceCard } from "@/components/ui/three-d-quiz-choice-card";

import {
  useCompleteLesson,
  useSubmitExercise,
} from "@/features/lessons/hooks/use-lesson-progress";
import type { Lesson } from "@/features/lessons/types/lesson";

type Feedback = {
  correct: boolean;
  text: string;
  correctAnswer?: string;
};

type QuizChoiceState = "idle" | "selected" | "correct" | "incorrect";

type LessonQuizSheetProps = {
  lesson: Lesson;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFinished: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase();
}

function resolveOption(
  candidate: unknown,
  options: readonly string[],
): string | undefined {
  /*
   * Réponse directement sous forme de texte.
   */
  if (typeof candidate === "string") {
    const normalized = normalizeAnswer(candidate);

    /*
     * "A", "B", "C", "D"
     */
    const letterIndex = LETTERS.findIndex(
      (letter) => letter.toLowerCase() === normalized,
    );

    if (letterIndex >= 0 && options[letterIndex]) {
      return options[letterIndex];
    }

    /*
     * Réponse = texte réel de l'option.
     */
    const matchingOption = options.find(
      (option) => normalizeAnswer(option) === normalized,
    );

    if (matchingOption) {
      return matchingOption;
    }

    /*
     * Index transmis comme string.
     */
    const numeric = Number(candidate);

    if (Number.isInteger(numeric) && numeric >= 0 && numeric < options.length) {
      return options[numeric];
    }
  }

  /*
   * Index transmis comme nombre.
   */
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

  /*
   * Réponse directement renvoyée par l'API.
   */
  const directCandidates = [
    resultData.correct_answer,
    resultData.correctAnswer,
    resultData.correct_option,
    resultData.correctOption,
    resultData.expected_answer,
    resultData.expectedAnswer,
    resultData.expected_option,
    resultData.expectedOption,
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

  for (const candidate of directCandidates) {
    const resolved = resolveOption(candidate, options);

    if (resolved) {
      return resolved;
    }
  }

  /*
   * Certains backends imbriquent la réponse.
   */
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

    const candidates = [
      object.correct_answer,
      object.correctAnswer,
      object.correct_option,
      object.correctOption,
      object.expected_answer,
      object.expectedAnswer,
      object.answer,
      object.solution,
    ];

    for (const candidate of candidates) {
      const resolved = resolveOption(candidate, options);

      if (resolved) {
        return resolved;
      }
    }
  }

  return undefined;
}

export function LessonQuizSheet({
  lesson,
  isOpen,
  onOpenChange,
  onFinished,
}: LessonQuizSheetProps) {
  const insets = useSafeAreaInsets();

  const inputHandlers = useBottomSheetAwareHandlers();

  const { toast } = useToast();

  const successForeground = useThemeColor("success-foreground");

  const dangerForeground = useThemeColor("danger-foreground");

  const feedbackToastId = useRef<string | null>(null);

  const [questionIndex, setQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] = useState<Feedback>();

  const submit = useSubmitExercise(lesson.slug);

  const complete = useCompleteLesson(lesson.slug);

  const exercise = lesson.exercises[questionIndex];

  const totalQuestions = lesson.exercises.length;

  const isLastQuestion = questionIndex === totalQuestions - 1;

  /*
   * ===========================
   * TOAST
   * ===========================
   */

  const hideFeedbackToast = () => {
    if (!feedbackToastId.current) {
      return;
    }

    toast.hide(feedbackToastId.current);

    feedbackToastId.current = null;
  };

  const showFeedbackToast = (correct: boolean, description: string) => {
    hideFeedbackToast();

    const foreground = correct ? successForeground : dangerForeground;

    const id = toast.show({
      duration: "persistent",

      component: (props) => (
        <Toast
          {...props}
          variant={correct ? "success" : "danger"}
          isSwipeable
          className={correct ? "bg-success" : "bg-danger"}
        >
          <View className="flex-row items-start gap-3">
            <View className="pt-0.5">
              <Ionicons
                name={correct ? "checkmark-circle" : "close-circle"}
                size={22}
                color={foreground}
              />
            </View>

            <View className="flex-1 gap-1">
              <Toast.Title
                style={{
                  color: foreground,
                }}
              >
                {correct ? "Bonne réponse" : "Réponse incorrecte"}
              </Toast.Title>

              <Toast.Description
                style={{
                  color: foreground,
                }}
              >
                {description}
              </Toast.Description>
            </View>
          </View>
        </Toast>
      ),
    });

    feedbackToastId.current = id;
  };

  /*
   * ===========================
   * RESET
   * ===========================
   */

  const resetQuestion = () => {
    setAnswer("");
    setFeedback(undefined);

    submit.reset();
  };

  /*
   * ===========================
   * SHEET
   * ===========================
   */

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      hideFeedbackToast();
    }

    onOpenChange(open);

    if (open) {
      setQuestionIndex(0);

      resetQuestion();

      complete.reset();
    }
  };

  /*
   * ===========================
   * VALIDATION
   * ===========================
   */

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

      const correctAnswer =
        result.correct_answer ?? getCorrectAnswer(result, exercise);

      setFeedback({
        correct: result.is_correct,

        text,

        correctAnswer,
      });

      showFeedbackToast(result.is_correct, text);
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Impossible de valider la réponse.";

      toast.show({
        variant: "danger",
        duration: 5000,
        isSwipeable: true,
        label: "Impossible de valider",
        description: message,
      });
    }
  };

  /*
   * ===========================
   * NEXT
   * ===========================
   */

  const goToNextQuestion = () => {
    if (isLastQuestion) {
      return;
    }

    hideFeedbackToast();

    setQuestionIndex((current) => current + 1);

    resetQuestion();
  };

  /*
   * ===========================
   * FINISH
   * ===========================
   */

  const finishQuiz = async () => {
    try {
      hideFeedbackToast();

      await complete.mutateAsync();

      onOpenChange(false);

      onFinished();
    } catch {
      // complete.error affiché dans l'UI
    }
  };

  /*
   * ===========================
   * ÉTAT VISUEL D'UNE RÉPONSE
   * ===========================
   */

  const getChoiceState = (option: string): QuizChoiceState => {
    /*
     * AVANT VALIDATION
     */
    if (!feedback) {
      return answer === option ? "selected" : "idle";
    }

    /*
     * OPTION CORRECTE
     */
    if (
      feedback.correctAnswer &&
      normalizeAnswer(feedback.correctAnswer) === normalizeAnswer(option)
    ) {
      return "correct";
    }

    /*
     * L'utilisateur avait raison.
     */
    if (feedback.correct && answer === option) {
      return "correct";
    }

    /*
     * Mauvais choix utilisateur.
     */
    if (!feedback.correct && answer === option) {
      return "incorrect";
    }

    return "idle";
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay
          variant="blur"
          isCloseOnPress={false}
          blurViewProps={{
            intensity: 40,
          }}
        />

        <BottomSheet.Content
          snapPoints={["100%"]}
          enableDynamicSizing={false}
          enableOverDrag={false}
          enablePanDownToClose={false}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
          handleComponent={() => null}
          className="m-0"
          backgroundClassName="rounded-none bg-app-background"
          contentContainerClassName="h-full p-0"
        >
          <View className="flex-1 bg-app-background">
            {/* HEADER */}

            <View
              className="flex-row items-center justify-between px-2 pb-2"
              style={{
                paddingTop: insets.top + 5,
              }}
            >
              <Text className="text-base font-bold text-foreground">
                {totalQuestions > 0
                  ? `${questionIndex + 1}/${totalQuestions}`
                  : "Quiz"}
              </Text>

              <BottomSheet.Close />
            </View>

            {/* PROGRESS */}

            {totalQuestions > 0 ? (
              <View className="px-2 pb-3">
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
            ) : null}

            {/* CONTENT */}

            <BottomSheetScrollView
              className="flex-1"
              contentContainerStyle={{
                flexGrow: 1,

                paddingHorizontal: 0,

                paddingTop: 4,

                paddingBottom: 56 + insets.bottom,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {exercise ? (
                <View
                  style={{
                    flex: 1,

                    justifyContent: "center",

                    gap: 32,
                  }}
                >
                  {/* QUESTION */}

                  <View className="items-center gap-2 px-2">
                    <Text className="text-center text-[10px] font-bold uppercase tracking-[2px] text-muted">
                      Question {questionIndex + 1}
                    </Text>

                    <Text className="text-center text-2xl font-bold leading-8 text-foreground">
                      {exercise.question}
                    </Text>
                  </View>

                  {/* ANSWERS */}

                  {exercise.options?.length ? (
                    <View className="flex-row flex-wrap gap-1 px-2">
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
                    <View className="px-2">
                      <Input
                        isDisabled={Boolean(feedback) || submit.isPending}
                        placeholder="Écris ta réponse"
                        value={answer}
                        onBlur={inputHandlers.onBlur}
                        onFocus={inputHandlers.onFocus}
                        onChangeText={setAnswer}
                      />
                    </View>
                  )}

                  {submit.error ? (
                    <Text className="px-2 text-center text-sm text-danger">
                      {submit.error.message}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View className="flex-1 items-center justify-center gap-4 px-4">
                  <View className="size-16 items-center justify-center bg-surface-secondary">
                    <Ionicons name="school-outline" size={28} color="#777" />
                  </View>

                  <View className="items-center gap-1">
                    <Text className="text-lg font-bold text-foreground">
                      Aucun quiz
                    </Text>

                    <Text className="text-center text-sm text-muted">
                      Cette leçon ne contient pas encore de question.
                    </Text>
                  </View>
                </View>
              )}

              {complete.error ? (
                <Text className="px-2 text-center text-sm text-danger">
                  {complete.error.message}
                </Text>
              ) : null}
            </BottomSheetScrollView>

            {/* FOOTER */}

            {exercise ? (
              <View
                className="absolute bottom-0 left-0 right-0 bg-app-background px-2 pt-1"
                style={{
                  paddingBottom: insets.bottom,
                }}
              >
                {!feedback ? (
                  <GameButton
                    title={submit.isPending ? "Validation…" : "Valider"}
                    variant="accent"
                    icon="checkmark"
                    iconPosition="right"
                    height={40}
                    onPress={() => void validateAnswer()}
                    disabled={!answer.trim() || submit.isPending}
                    loading={submit.isPending}
                  />
                ) : (
                  <GameButton
                    title={isLastQuestion ? "Terminer" : "Question suivante"}
                    variant={isLastQuestion ? "success" : "accent"}
                    icon={
                      isLastQuestion
                        ? "checkmark-circle-outline"
                        : "arrow-forward"
                    }
                    iconPosition="right"
                    height={40}
                    onPress={() =>
                      void (isLastQuestion ? finishQuiz() : goToNextQuestion())
                    }
                    loading={complete.isPending}
                    loadingText="Enregistrement…"
                  />
                )}
              </View>
            ) : null}
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
