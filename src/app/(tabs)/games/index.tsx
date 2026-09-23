import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { ThreeDCard } from "@/components/ui/three-d-card";

const GAMES = [
  {
    id: "buzz-wort",
    title: "Buzz Wort",
    description: "Un mot. Un buzz. Sois le plus rapide.",
    meta: "2–4 joueurs · 3 min",
    icon: "game-controller-outline" as const,
    colors: ["#5B4BB7", "#211A51"] as const,
    depth: "#171139",
  },
] as const;

export default function GamesHomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="gap-6 px-4 pb-8 pt-3"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text className="text-2xl font-bold text-foreground">Jeux</Text>
        <Text className="text-sm leading-5 text-muted">
          Entre dans une partie et mets ton allemand à l’épreuve.
        </Text>
      </View>

      <View className="gap-4">
        {GAMES.map((game) => (
          <ThreeDCard
            key={game.id}
            onPress={() => router.push("/games/buzz-wort")}
            depth={7}
            pressDepth={3}
            radius={3}
            depthColor={game.depth}
            containerClassName="w-full"
            className="h-52 w-full overflow-hidden p-0"
          >
            <LinearGradient
              colors={game.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            >
              <View className="absolute -right-8 -top-10 size-36 rounded-full border border-white/10" />
              <View className="absolute -bottom-12 -left-8 size-32 rounded-full bg-white/5" />

              <View className="flex-1 justify-between p-5">
                <View className="flex-row items-start justify-between">
                  <View className="size-12 items-center justify-center rounded-2xl bg-white/15">
                    <Ionicons name={game.icon} size={25} color="white" />
                  </View>

                  <View className="size-9 items-center justify-center rounded-full bg-white">
                    <Ionicons name="arrow-forward" size={17} color="#211A51" />
                  </View>
                </View>

                <View className="gap-1">
                  <Text className="text-2xl font-black text-white">
                    {game.title}
                  </Text>
                  <Text className="text-sm text-white/70">
                    {game.description}
                  </Text>
                  <Text className="mt-2 text-[10px] font-bold tracking-widest text-white/45">
                    {game.meta.toUpperCase()}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ThreeDCard>
        ))}
      </View>

      <View className="items-center gap-2 py-5">
        <Ionicons name="sparkles-outline" size={20} color="#9A9AAB" />
        <Text className="text-center text-sm text-muted">
          D’autres jeux arrivent bientôt.
        </Text>
      </View>
    </ScrollView>
  );
}
