import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useThemeColor } from "heroui-native/hooks";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  VOCABULARY_SESSIONS,
  type VocabularyExercise,
} from "@/features/practice/data/vocabulary-sessions";

export function VocabularySessionScreen() {
  const { theme } = useLocalSearchParams<{
    theme: string;
  }>();

  const [accentColor, successColor, dangerColor, foregroundColor, mutedColor] =
    useThemeColor(["accent", "success", "danger", "foreground", "muted"]);

  const session = VOCABULARY_SESSIONS[theme];

  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState("");
  const [validated, setValidated] = useState(false);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = session?.exercises[index];

  const currentAnswer = useMemo(() => {
    if (!exercise) return "";

    if (exercise.type === "input") {
      return inputAnswer.trim();
    }

    return selectedAnswer ?? "";
  }, [exercise, inputAnswer, selectedAnswer]);

  const isCorrect = useMemo(() => {
    if (!exercise) return false;

    return normalizeAnswer(currentAnswer) === normalizeAnswer(exercise.answer);
  }, [exercise, currentAnswer]);

  if (!session || !exercise) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background px-6">
        <Text className="text-xl font-bold text-foreground">
          Session introuvable
        </Text>
      </View>
    );
  }

  const progress = ((index + 1) / session.exercises.length) * 100;

  const validate = () => {
    if (!currentAnswer) return;

    if (isCorrect) {
      setCorrectAnswers((value) => value + 1);
    }

    setValidated(true);
  };

  const next = () => {
    if (index === session.exercises.length - 1) {
      setFinished(true);
      return;
    }

    setIndex((value) => value + 1);
    setSelectedAnswer(null);
    setInputAnswer("");
    setValidated(false);
  };

  const restart = () => {
    setIndex(0);
    setSelectedAnswer(null);
    setInputAnswer("");
    setValidated(false);
    setCorrectAnswers(0);
    setFinished(false);
  };

  if (finished) {
    const percentage = Math.round(
      (correctAnswers / session.exercises.length) * 100,
    );

    return (
      <ScrollView
        className="flex-1 bg-app-background"
        contentContainerClassName="mx-auto w-full max-w-3xl flex-grow justify-center gap-6 px-4 py-10"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="items-center gap-4">
          <View className="size-20 items-center justify-center rounded-full bg-accent/10">
            <Ionicons name="trophy-outline" size={38} color={accentColor} />
          </View>

          <View className="items-center gap-1">
            <Text className="text-3xl font-bold text-foreground">
              Session terminée
            </Text>

            <Text className="text-center text-sm text-muted">
              {session.title}
            </Text>
          </View>
        </View>

        <Card className="gap-5">
          <View className="items-center gap-1">
            <Text className="text-5xl font-bold text-foreground">
              {percentage}%
            </Text>

            <Text className="text-sm text-muted">
              {correctAnswers}/{session.exercises.length} réponses correctes
            </Text>
          </View>

          <View className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
            <View
              className="h-full rounded-full bg-accent"
              style={{
                width: `${percentage}%`,
              }}
            />
          </View>
        </Card>

        <View className="gap-3">
          <Button onPress={restart}>
            <Button.Label>Refaire la session</Button.Label>
          </Button>

          <Button
            variant="secondary"
            onPress={() => router.replace("/practice/vocabulary/index")}
          >
            <Button.Label>Choisir un autre thème</Button.Label>
          </Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-app-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-3xl gap-7 px-4 pb-24 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* PROGRESSION */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-muted">
              {session.title}
            </Text>

            <Text className="text-xs font-bold text-foreground">
              {index + 1}/{session.exercises.length}
            </Text>
          </View>

          <View className="h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
            <View
              className="h-full rounded-full bg-accent"
              style={{
                width: `${progress}%`,
              }}
            />
          </View>
        </View>

        {/* QUESTION */}
        <View className="gap-3">
          <Text className="text-[10px] font-bold tracking-widest text-accent">
            {exercise.instruction}
          </Text>

          {exercise.type === "listen" ? (
            <ListeningPrompt
              text={exercise.audioText}
              accentColor={accentColor}
            />
          ) : (
            <Text className="text-3xl font-bold leading-10 text-foreground">
              {exercise.prompt}
            </Text>
          )}

          <Text className="text-sm text-muted">
            {exercise.type === "input"
              ? "Écris ta réponse."
              : exercise.type === "listen"
                ? "Écoute puis choisis la bonne traduction."
                : "Choisis la bonne réponse."}
          </Text>
        </View>

        {/* EXERCICE */}
        {exercise.type === "input" ? (
          <TextInput
            value={inputAnswer}
            editable={!validated}
            onChangeText={setInputAnswer}
            placeholder={exercise.placeholder}
            placeholderTextColor={mutedColor}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            className="h-14 rounded-2xl bg-surface-secondary px-4 text-base text-foreground"
            style={{
              borderWidth: validated ? 2 : 0,
              borderColor: validated
                ? isCorrect
                  ? successColor
                  : dangerColor
                : "transparent",
            }}
          />
        ) : (
          <View className="gap-3">
            {exercise.choices.map((choice) => (
              <AnswerChoice
                key={choice}
                choice={choice}
                selected={selectedAnswer === choice}
                validated={validated}
                correctAnswer={exercise.answer}
                onPress={() => {
                  if (!validated) {
                    setSelectedAnswer(choice);
                  }
                }}
                accentColor={accentColor}
                successColor={successColor}
                dangerColor={dangerColor}
                foregroundColor={foregroundColor}
              />
            ))}
          </View>
        )}

        {/* FEEDBACK */}
        {validated ? (
          <FeedbackCard
            exercise={exercise}
            correct={isCorrect}
            successColor={successColor}
            dangerColor={dangerColor}
          />
        ) : null}

        {/* ACTION */}
        {!validated ? (
          <Button
            className="w-full"
            isDisabled={!currentAnswer}
            onPress={validate}
          >
            <Button.Label>Valider</Button.Label>
          </Button>
        ) : (
          <Button className="w-full" onPress={next}>
            <Button.Label>
              {index === session.exercises.length - 1
                ? "Voir mon résultat"
                : "Continuer"}
            </Button.Label>

            <Ionicons name="arrow-forward" size={18} color="white" />
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AnswerChoice({
  choice,
  selected,
  validated,
  correctAnswer,
  onPress,
  accentColor,
  successColor,
  dangerColor,
  foregroundColor,
}: {
  choice: string;
  selected: boolean;
  validated: boolean;
  correctAnswer: string;
  onPress: () => void;
  accentColor: string;
  successColor: string;
  dangerColor: string;
  foregroundColor: string;
}) {
  const isCorrectChoice = choice === correctAnswer;

  let borderColor = "transparent";
  let iconColor = foregroundColor;
  let iconName: "ellipse-outline" | "checkmark-circle" | "close-circle" =
    "ellipse-outline";

  if (!validated && selected) {
    borderColor = accentColor;
  }

  if (validated && isCorrectChoice) {
    borderColor = successColor;
    iconColor = successColor;
    iconName = "checkmark-circle";
  }

  if (validated && selected && !isCorrectChoice) {
    borderColor = dangerColor;
    iconColor = dangerColor;
    iconName = "close-circle";
  }

  return (
    <Button
      variant="secondary"
      className="h-14 w-full justify-start rounded-2xl"
      onPress={onPress}
      style={{
        borderWidth: selected || (validated && isCorrectChoice) ? 2 : 0,
        borderColor,
      }}
    >
      <Ionicons name={iconName} size={20} color={iconColor} />

      <Button.Label className="flex-1 text-left">{choice}</Button.Label>
    </Button>
  );
}

function ListeningPrompt({
  text,
  accentColor,
}: {
  text: string;
  accentColor: string;
}) {
  const play = () => {
    Speech.stop();

    Speech.speak(text, {
      language: "de-DE",
      rate: 0.85,
      pitch: 1,
    });
  };

  return (
    <View className="items-center py-4">
      <Button
        accessibilityLabel="Écouter le mot"
        isIconOnly
        className="size-20 rounded-full"
        onPress={play}
      >
        <Ionicons name="volume-high" size={32} color="white" />
      </Button>

      <Text className="mt-3 text-xs font-medium" style={{ color: accentColor }}>
        Appuie pour écouter
      </Text>
    </View>
  );
}

function FeedbackCard({
  exercise,
  correct,
  successColor,
  dangerColor,
}: {
  exercise: VocabularyExercise;
  correct: boolean;
  successColor: string;
  dangerColor: string;
}) {
  return (
    <Card className={correct ? "gap-2 bg-success/10" : "gap-2 bg-danger/10"}>
      <View className="flex-row items-center gap-2">
        <Ionicons
          name={correct ? "checkmark-circle" : "information-circle"}
          size={22}
          color={correct ? successColor : dangerColor}
        />

        <Text
          className={
            correct
              ? "text-base font-bold text-success"
              : "text-base font-bold text-danger"
          }
        >
          {correct ? "Très bien !" : "À retenir"}
        </Text>
      </View>

      {!correct ? (
        <Text className="text-sm leading-5 text-foreground">
          Bonne réponse : <Text className="font-bold">{exercise.answer}</Text>
        </Text>
      ) : null}

      {exercise.explanation ? (
        <Text className="text-sm leading-5 text-muted">
          {exercise.explanation}
        </Text>
      ) : null}
    </Card>
  );
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/[.!?,;:]/g, "");
}
