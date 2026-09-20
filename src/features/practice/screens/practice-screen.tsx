import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { ThreeDCard } from "@/components/ui/three-d-card";

const PRACTICE_ITEMS = [
  {
    id: "vocabulary",
    kicker: "MÉMOIRE",
    title: "Vocabulaire",
    description: "Apprends et révise les mots du quotidien.",
    modes: "Thèmes · Mots · Expressions",
    icon: "albums-outline" as const,
    colors: ["#283B63", "#182238"] as const,
    depth: "#0F1726",
    enabled: true,
  },
  {
    id: "grammar",
    kicker: "STRUCTURES",
    title: "Grammaire",
    description: "Entraîne les règles et construis tes phrases.",
    modes: "Compléter · Corriger · Construire",
    icon: "git-branch-outline" as const,
    colors: ["#315C55", "#19332F"] as const,
    depth: "#0E211E",
    enabled: false,
  },
  {
    id: "listening",
    kicker: "COMPRÉHENSION",
    title: "Écoute",
    description: "Habitue ton oreille à l’allemand.",
    modes: "Dialogues · Dictée · Comprendre",
    icon: "headset-outline" as const,
    colors: ["#68436A", "#352236"] as const,
    depth: "#241525",
    enabled: false,
  },
  {
    id: "pronunciation",
    kicker: "ORAL",
    title: "Prononciation",
    description: "Travaille les sons et gagne en fluidité.",
    modes: "Écouter · Répéter · Comparer",
    icon: "mic-outline" as const,
    colors: ["#765032", "#3C291A"] as const,
    depth: "#29190E",
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
      contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View className="gap-3">
        <View className="gap-1">
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Que voulez-vous travailler ?
          </Text>

          <Text className="max-w-[92%] text-sm leading-5 text-muted">
            Choisissez une compétence et lancez une session ciblée.
          </Text>
        </View>
      </View>

      {/* PRACTICE GRID */}
      <View className="flex-row flex-wrap gap-3">
        {PRACTICE_ITEMS.map((item, index) => (
          <View key={item.id} className="w-[48%]">
            <ThreeDCard
              onPress={() => handlePress(item.id)}
              disabled={!item.enabled}
              disabledOpacity={0.35}
              depth={6}
              pressDepth={3}
              radius={2}
              containerClassName="w-full"
              className="h-48 w-full overflow-hidden p-0"
            >
              <LinearGradient
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                }}
              >
                {/* DECOR */}
                <View className="absolute -right-10 -top-12 size-28 rounded-full border border-white/10" />

                <View className="absolute -bottom-10 -left-8 size-24 rounded-full bg-white/5" />

                <View className="flex-1 justify-between p-3">
                  {/* TOP */}
                  <View className="flex-row items-start justify-between">
                    <View className="size-10 items-center justify-center rounded-xl bg-white/10">
                      <Ionicons name={item.icon} size={21} color="white" />
                    </View>

                    {item.enabled ? (
                      <View className="size-8 items-center justify-center rounded-full bg-white">
                        <Ionicons
                          name="arrow-forward"
                          size={15}
                          color="#171717"
                        />
                      </View>
                    ) : (
                      <View className="rounded-full bg-white/10 px-2 py-1">
                        <Text className="text-[8px] font-bold tracking-wider text-white/65">
                          BIENTÔT
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* IDENTITY */}
                  <View className="gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[9px] font-bold tracking-[1.5px] text-white/45">
                        {String(index + 1).padStart(2, "0")}
                      </Text>

                      <Text className="text-[9px] font-bold tracking-[1.5px] text-white/55">
                        {item.kicker}
                      </Text>
                    </View>

                    <Text
                      className="text-lg font-bold leading-6 text-white"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    <Text
                      className="text-xs leading-4 text-white/65"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>

                  {/* BOTTOM */}
                  <View className="gap-2">
                    <View className="h-px bg-white/10" />

                    <Text
                      className="text-[9px] font-semibold text-white/45"
                      numberOfLines={1}
                    >
                      {item.modes}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </ThreeDCard>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
