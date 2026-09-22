import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { useThemeColor } from "heroui-native/hooks";
import { Text, View } from "react-native";

import type { Level } from "@/features/learn/levels/types/level";

const STATUS_LABELS = {
  available: "Disponible",
  in_progress: "En cours",
  completed: "Terminé",
} as const;

const STATUS_ICONS = {
  available: "ellipse-outline" as const,
  in_progress: "play-circle" as const,
  completed: "checkmark-circle" as const,
};

export function LevelOverviewCard({ level }: { level: Level }) {
  const [accentColor, defaultColor, successColor, warningColor] = useThemeColor(
    ["accent", "default-foreground", "success", "warning"],
  );
  const isInProgress = level.status === "in_progress";
  const isCompleted = level.status === "completed";
  const statusColor = isCompleted
    ? successColor
    : isInProgress
      ? warningColor
      : defaultColor;

  const openLevel = () => {
    router.push({
      pathname: "/learn/levels/[level]",
      params: { level: level.code, title: level.title },
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
            <Chip.Label>{level.code}</Chip.Label>
          </Chip>

          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Card.Title className="min-w-0 shrink text-sm" numberOfLines={1}>
              {level.title}
            </Card.Title>
            <Chip
              color={
                isCompleted ? "success" : isInProgress ? "warning" : "default"
              }
              size="sm"
              variant="soft"
            >
              <Ionicons
                color={statusColor}
                name={STATUS_ICONS[level.status]}
                size={13}
              />
              <Chip.Label>{STATUS_LABELS[level.status]}</Chip.Label>
            </Chip>
          </View>

          <Button
            accessibilityLabel={`Ouvrir le niveau ${level.code}`}
            isIconOnly
            size="sm"
            variant="secondary"
            onPress={openLevel}
          >
            <Ionicons color={accentColor} name="arrow-forward" size={18} />
          </Button>
        </View>

        <Card.Description className="w-full text-sm leading-5">
          {level.description}
        </Card.Description>
      </Card.Header>

      <Card.Body>
        <View className="gap-2 rounded-2xl bg-surface-secondary p-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs font-medium text-muted">
              Progression du cycle
            </Text>
            <Text className="text-xs font-bold text-foreground">
              {level.progress}% · {level.completed_lessons_count}/
              {level.lessons_count} leçons
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
            <View
              className="h-full rounded-full bg-accent"
              style={{ width: `${level.progress}%` }}
            />
          </View>
        </View>
      </Card.Body>

      <Card.Footer>
        <Button className="w-full" onPress={openLevel}>
          {isInProgress
            ? "Continuer le niveau"
            : isCompleted
              ? "Réviser le niveau"
              : "Voir les chapitres"}
        </Button>
      </Card.Footer>
    </Card>
  );
}
