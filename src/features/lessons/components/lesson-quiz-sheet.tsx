import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import {
  useBottomSheetAwareHandlers,
  useThemeColor,
} from "heroui-native/hooks";
import { Input } from "heroui-native/input";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  useCompleteLesson,
  useSubmitExercise,
} from "@/features/lessons/hooks/use-lesson-progress";
import type { Exercise } from "@/features/lessons/types/exercise";
import type { Lesson } from "@/features/lessons/types/lesson";

type Feedback = {
  correct: boolean;
  text: string;
};

type QuizQuestionProps = {
  answer: string;
  exercise: Exercise;
  feedback?: Feedback;
  isPending: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
};

function QuizQuestion({
  answer,
  exercise,
  feedback,
  isPending,
  onAnswerChange,
  onSubmit,
}: QuizQuestionProps) {
  const inputHandlers = useBottomSheetAwareHandlers();

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold leading-6 text-foreground">
        {exercise.question}
      </Text>

      {exercise.options?.length ? (
        <View className="gap-2">
          {exercise.options.map((option) => (
            <Button
              key={option}
              isDisabled={Boolean(feedback) || isPending}
              variant={answer === option ? "primary" : "outline"}
              onPress={() => onAnswerChange(option)}
            >
              {option}
            </Button>
          ))}
        </View>
      ) : (
        <Input
          isDisabled={Boolean(feedback) || isPending}
          placeholder="Ta réponse"
          value={answer}
          onBlur={inputHandlers.onBlur}
          onChangeText={onAnswerChange}
          onFocus={inputHandlers.onFocus}
        />
      )}

      {!feedback ? (
        <Button isDisabled={!answer.trim() || isPending} onPress={onSubmit}>
          {isPending ? "Validation…" : "Valider ma réponse"}
        </Button>
      ) : (
        <View
          className={`rounded-2xl p-4 ${feedback.correct ? "bg-success/15" : "bg-danger/15"}`}
        >
          <Text
            className={`font-semibold ${feedback.correct ? "text-success" : "text-danger"}`}
          >
            {feedback.correct ? "Bonne réponse" : "Réponse incorrecte"}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-foreground">
            {feedback.text}
          </Text>
        </View>
      )}
    </View>
  );
}

export function LessonQuizSheet({
  lesson,
  onFinished,
}: {
  lesson: Lesson;
  onFinished: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>();
  const [accentColor] = useThemeColor(["accent"]);
  const submit = useSubmitExercise(lesson.slug);
  const complete = useCompleteLesson(lesson.slug);
  const exercise = lesson.exercises[questionIndex];
  const isLastQuestion = questionIndex === lesson.exercises.length - 1;

  const resetQuestion = () => {
    setAnswer("");
    setFeedback(undefined);
    submit.reset();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setQuestionIndex(0);
      resetQuestion();
      complete.reset();
    }
  };

  const validateAnswer = async () => {
    if (!exercise || !answer.trim()) return;

    try {
      const result = await submit.mutateAsync({
        exercise: exercise.id,
        answer,
      });
      setFeedback({
        correct: result.is_correct,
        text:
          result.explanation ??
          (result.is_correct
            ? "Très bien !"
            : "Continue, cette notion mérite une révision."),
      });
    } catch (reason) {
      setFeedback({
        correct: false,
        text: reason instanceof Error ? reason.message : "Réponse impossible.",
      });
    }
  };

  const goToNextQuestion = () => {
    setQuestionIndex((current) => current + 1);
    resetQuestion();
  };

  const finishQuiz = async () => {
    try {
      await complete.mutateAsync();
      setIsOpen(false);
      onFinished();
    } catch {
      // The mutation error is rendered below.
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Card className="gap-3 rounded-3xl p-4" variant="secondary">
        <Card.Header className="gap-3 p-0">
          <View className="flex-row items-center gap-3">
            <View className="size-10 items-center justify-center self-center rounded-2xl bg-accent/15">
              <Ionicons color={accentColor} name="school-outline" size={21} />
            </View>

            <Card.Title className="flex-1">Mini quiz</Card.Title>

            <View className="flex-row items-center gap-2">
              <Chip animation="disable-all" size="sm" variant="soft">
                <Chip.Label>
                  {lesson.exercises.length} question
                  {lesson.exercises.length > 1 ? "s" : ""}
                </Chip.Label>
              </Chip>

              {lesson.score !== null && (
                <Chip
                  animation="disable-all"
                  color="accent"
                  size="sm"
                  variant="soft"
                >
                  <Chip.Label>{lesson.score}%</Chip.Label>
                </Chip>
              )}
            </View>
          </View>

          <Card.Description className="w-full">
            Teste ce que tu viens d’apprendre avec quelques questions rapides.
          </Card.Description>
        </Card.Header>

        <Card.Footer className="p-0 pt-1">
          <BottomSheet.Trigger asChild>
            <Button className="w-full">
              {lesson.status === "completed"
                ? "Refaire le quiz"
                : "Faire le quiz"}
            </Button>
          </BottomSheet.Trigger>
        </Card.Footer>
      </Card>

      <BottomSheet.Portal>
        <BottomSheet.Overlay variant="blur" blurViewProps={{ intensity: 40 }} />
        <BottomSheet.Content
          contentContainerClassName="h-full"
          enableDynamicSizing={false}
          enableOverDrag={false}
          keyboardBehavior="extend"
          snapPoints={["85%"]}
        >
          <BottomSheet.Close />
          <BottomSheetScrollView
            contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-1 pr-12">
              <BottomSheet.Title>Quiz · {lesson.title}</BottomSheet.Title>
              <BottomSheet.Description>
                Sélectionne une réponse, puis valide-la explicitement.
              </BottomSheet.Description>
            </View>

            {exercise ? (
              <>
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-muted">
                      Question {questionIndex + 1} sur {lesson.exercises.length}
                    </Text>
                    <Text className="text-sm font-semibold text-accent">
                      {Math.round(
                        ((questionIndex + 1) / lesson.exercises.length) * 100,
                      )}
                      %
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
                    <View
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${((questionIndex + 1) / lesson.exercises.length) * 100}%`,
                      }}
                    />
                  </View>
                </View>

                <QuizQuestion
                  answer={answer}
                  exercise={exercise}
                  feedback={feedback}
                  isPending={submit.isPending}
                  onAnswerChange={setAnswer}
                  onSubmit={() => void validateAnswer()}
                />

                {feedback ? (
                  <Button
                    isDisabled={complete.isPending}
                    onPress={() =>
                      void (isLastQuestion ? finishQuiz() : goToNextQuestion())
                    }
                  >
                    {isLastQuestion
                      ? complete.isPending
                        ? "Enregistrement…"
                        : "Terminer la leçon"
                      : "Question suivante"}
                  </Button>
                ) : null}
              </>
            ) : (
              <View className="gap-4">
                <Text className="text-foreground">
                  Cette leçon ne contient pas encore de question.
                </Text>
                <Button
                  isDisabled={complete.isPending}
                  onPress={() => void finishQuiz()}
                >
                  Terminer la leçon
                </Button>
              </View>
            )}

            {complete.error ? (
              <Text className="text-sm text-danger">
                {complete.error.message}
              </Text>
            ) : null}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
