import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { useThemeColor } from "heroui-native/hooks";
import { Text, View } from "react-native";

import type { Chapter } from "@/features/chapters/types/chapter";

const STATUS_LABELS = {
  available: "À faire",
  in_progress: "En cours",
  completed: "Terminé",
} as const;

const STATUS_ICONS = {
  available: "ellipse-outline" as const,
  in_progress: "play-circle" as const,
  completed: "checkmark-circle" as const,
};

export function ChapterOverviewCard({ chapter }: { chapter: Chapter }) {
  const [accentColor, defaultColor, successColor, warningColor] =
    useThemeColor([
      "accent",
      "default-foreground",
      "success",
      "warning",
    ]);
  const isInProgress = chapter.status === "in_progress";
  const isCompleted = chapter.status === "completed";
  const statusColor = isCompleted
      ? successColor
      : isInProgress
        ? warningColor
        : defaultColor;

  const openChapter = () => {
    router.push({
      pathname: "/chapters/[chapter]",
      params: { chapter: chapter.slug, title: chapter.title },
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
            <Chip.Label>{String(chapter.order).padStart(2, "0")}</Chip.Label>
          </Chip>

          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Card.Title className="min-w-0 shrink text-sm" numberOfLines={1}>
              {chapter.title}
            </Card.Title>
            <Chip
              color={isCompleted ? "success" : isInProgress ? "warning" : "default"}
              size="sm"
              variant="soft"
            >
              <Ionicons color={statusColor} name={STATUS_ICONS[chapter.status]} size={13} />
              <Chip.Label>{STATUS_LABELS[chapter.status]}</Chip.Label>
            </Chip>
          </View>

          <Button
            accessibilityLabel={`Ouvrir le chapitre ${chapter.title}`}
            isIconOnly
            size="sm"
            variant="secondary"
            onPress={openChapter}
          >
            <Ionicons color={accentColor} name="arrow-forward" size={18} />
          </Button>
        </View>

        {chapter.description ? (
          <Card.Description className="w-full text-sm leading-5">
            {chapter.description}
          </Card.Description>
        ) : null}
      </Card.Header>

      <Card.Body>
        <View className="gap-2 rounded-2xl bg-surface-secondary p-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs font-medium text-muted">Progression du chapitre</Text>
            <Text className="text-xs font-bold text-foreground">
              {chapter.progress}% · {chapter.completed_lessons_count}/{chapter.lessons_count} leçons
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
            <View className="h-full rounded-full bg-accent" style={{ width: `${chapter.progress}%` }} />
          </View>
        </View>
      </Card.Body>

      <Card.Footer>
        <Button className="w-full" onPress={openChapter}>
          {isInProgress
              ? "Continuer le chapitre"
              : isCompleted
                ? "Réviser le chapitre"
                : "Voir les leçons"}
        </Button>
      </Card.Footer>
    </Card>
  );
}
