import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { useThemeColor } from "heroui-native/hooks";
import { Text, View } from "react-native";

import type { LessonSummary } from "@/features/lessons/types/lesson";

const STATUS_LABELS = {
  available: "À faire",
  in_progress: "En cours",
  completed: "Terminée",
} as const;

const STATUS_ICONS = {
  available: "ellipse-outline" as const,
  in_progress: "play-circle" as const,
  completed: "checkmark-circle" as const,
};

export function LessonOverviewCard({ lesson }: { lesson: LessonSummary }) {
  const [accentColor, defaultColor, successColor, warningColor] =
    useThemeColor([
      "accent",
      "default-foreground",
      "success",
      "warning",
    ]);
  const isInProgress = lesson.status === "in_progress";
  const isCompleted = lesson.status === "completed";
  const statusColor = isCompleted
      ? successColor
      : isInProgress
        ? warningColor
        : defaultColor;

  const openLesson = () => {
    router.push({
      pathname: "/lessons/[lesson]",
      params: { lesson: lesson.slug, title: lesson.title },
    });
  };

  return (
    <Card className="gap-4 rounded-3xl">
      <Card.Header className="gap-3">
        <View className="flex-row items-center gap-2">
          <Chip
            className="self-center"
            color="accent"
            size="md"
            variant="primary"
          >
            <Chip.Label>Leçon {lesson.order}</Chip.Label>
          </Chip>

          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Card.Title className="min-w-0 shrink text-sm" numberOfLines={1}>
              {lesson.title}
            </Card.Title>
            <Chip
              color={isCompleted ? "success" : isInProgress ? "warning" : "default"}
              size="sm"
              variant="soft"
            >
              <Ionicons color={statusColor} name={STATUS_ICONS[lesson.status]} size={13} />
              <Chip.Label>{STATUS_LABELS[lesson.status]}</Chip.Label>
            </Chip>
          </View>

          <Button
            accessibilityLabel={`Ouvrir la leçon ${lesson.title}`}
            isIconOnly
            size="sm"
            variant="secondary"
            onPress={openLesson}
          >
            <Ionicons color={accentColor} name="arrow-forward" size={18} />
          </Button>
        </View>

        {lesson.summary ? (
          <Card.Description className="w-full text-sm leading-5">
            {lesson.summary}
          </Card.Description>
        ) : null}
      </Card.Header>

      <Card.Body>
        <View className="gap-2 rounded-2xl bg-surface-secondary p-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs font-medium text-muted">Progression des exercices</Text>
            <Text className="text-xs font-bold text-foreground">
              {lesson.progress}% · {lesson.answered_exercises_count}/{lesson.exercises_count} exercices
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
            <View className="h-full rounded-full bg-accent" style={{ width: `${lesson.progress}%` }} />
          </View>
        </View>
      </Card.Body>

      <Card.Footer>
        <Button className="w-full" onPress={openLesson}>
          {isInProgress
              ? "Continuer la leçon"
              : isCompleted
                ? "Réviser la leçon"
                : "Commencer la leçon"}
        </Button>
      </Card.Footer>
    </Card>
  );
}
