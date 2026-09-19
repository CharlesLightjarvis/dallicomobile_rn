import { router } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { ScrollView, Text, View } from "react-native";

const HOME_STATS = [
  { label: "Niveau", value: "A1" },
  { label: "Leçons", value: "1" },
  { label: "Série", value: "0 j" },
] as const;

export function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-2">
        <Chip className="self-start" color="accent" size="sm" variant="soft">
          <Chip.Label>Deutsch · A1</Chip.Label>
        </Chip>
        <Text selectable className="text-3xl font-bold text-foreground">
          Willkommen bei Dallico
        </Text>
        <Text selectable className="text-base leading-6 text-muted">
          Avance un peu chaque jour et construis des bases solides en allemand.
        </Text>
      </View>

      <Card>
        <Card.Body className="gap-4">
          <View className="gap-1">
            <Card.Title>Continuer à apprendre</Card.Title>
            <Card.Description>
              Reprends le parcours A1 avec les bases de l’allemand.
            </Card.Description>
          </View>
          <Button onPress={() => router.navigate("/(tabs)/learn")}>
            Continuer
          </Button>
        </Card.Body>
      </Card>

      <View className="gap-3">
        <Text selectable className="text-xl font-semibold text-foreground">
          Ton activité
        </Text>
        <View className="flex-row gap-3">
          {HOME_STATS.map((stat) => (
            <Card key={stat.label} className="flex-1">
              <Card.Body className="items-center gap-1 px-2 py-4">
                <Text selectable className="text-xl font-bold text-foreground">
                  {stat.value}
                </Text>
                <Text selectable className="text-xs text-muted">
                  {stat.label}
                </Text>
              </Card.Body>
            </Card>
          ))}
        </View>
      </View>

      <Card>
        <Card.Body className="gap-4">
          <View className="gap-1">
            <Card.Title>Entraînement rapide</Card.Title>
            <Card.Description>
              Teste tes acquis avec une courte session ciblée.
            </Card.Description>
          </View>
          <Button
            variant="secondary"
            onPress={() => router.navigate("/(tabs)/practice")}
          >
            Pratiquer maintenant
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
