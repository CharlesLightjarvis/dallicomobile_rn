import { router } from "expo-router";
import { Card } from "heroui-native/card";
import { Pressable, ScrollView, Text, View } from "react-native";

const PRACTICE_ITEMS = [
  {
    id: "vocabulary",
    kicker: "MÉMOIRE",
    title: "Vocabulaire",
    description: "Apprends et révise les mots du quotidien.",
    modes: "Thèmes · Mots · Expressions",
    enabled: true,
  },
  {
    id: "grammar",
    kicker: "STRUCTURES",
    title: "Grammaire",
    description: "Entraîne les règles et construis tes phrases.",
    modes: "Compléter · Corriger · Construire",
    enabled: false,
  },
  {
    id: "listening",
    kicker: "COMPRÉHENSION",
    title: "Écoute",
    description: "Habitue ton oreille à l’allemand.",
    modes: "Dialogues · Dictée · Comprendre",
    enabled: false,
  },
  {
    id: "pronunciation",
    kicker: "ORAL",
    title: "Prononciation",
    description: "Travaille les sons et la fluidité.",
    modes: "Écouter · Répéter · Comparer",
    enabled: false,
  },
] as const;

export function PracticeScreen() {
  const handlePress = (id: string) => {
    if (id === "vocabulary") {
      router.push("/practice/vocabulary");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-5 px-4 pb-24 pt-4"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text className="text-2xl font-bold text-foreground">Pratiquer</Text>

        <Text className="text-sm leading-5 text-muted">
          Choisis ce que tu veux travailler.
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {PRACTICE_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            className="w-[48%]"
            disabled={!item.enabled}
            onPress={() => handlePress(item.id)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : item.enabled ? 1 : 0.65,
            })}
          >
            <Card className="w-full p-2 h-36">
              <Card.Body className="gap-2 p-0">
                {/* MÉMOIRE + FLÈCHE */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-[10px] font-semibold tracking-wider text-accent">
                    {item.kicker}
                  </Text>

                  <Text className="text-xl leading-5 text-muted">›</Text>
                </View>

                <View className="gap-0.5">
                  <Text className="text-base font-bold text-foreground">
                    {item.title}
                  </Text>

                  <Text
                    className="text-xs leading-4 text-muted"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>

                <View className="h-px bg-separator" />

                <Text
                  className="text-[11px] font-medium leading-4 text-muted"
                  numberOfLines={1}
                >
                  {item.modes}
                </Text>
              </Card.Body>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
