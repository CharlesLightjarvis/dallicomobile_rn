import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ThreeDCard } from "@/components/ui/three-d-card";

const THEMES = [
  {
    id: "airport",
    title: "À l'aéroport",
    description: "Voyage, bagages et embarquement",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "restaurant",
    title: "Au restaurant",
    description: "Commander, demander et payer",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "hotel",
    title: "À l'hôtel",
    description: "Réserver et communiquer sur place",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "city",
    title: "En ville",
    description: "Se déplacer et demander son chemin",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "transport",
    title: "Les transports",
    description: "Train, bus et déplacements",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "shopping",
    title: "Les courses",
    description: "Produits, prix et quantités",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  },
] as const;

export function VocabularyScreen() {
  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="gap-5 px-4"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View className="gap-1">
        <Text className="text-2xl font-bold text-foreground">
          Choisis un thème
        </Text>

        <Text className="text-sm leading-5 text-muted">
          Travaille le vocabulaire dans une situation concrète.
        </Text>
      </View>

      {/* THEMES GRID */}
      <View className="flex-row flex-wrap gap-3">
        {THEMES.map((theme) => (
          <View key={theme.id} className="w-[48%]">
            <ThreeDCard
              onPress={() =>
                router.push({
                  pathname: "/practice/vocabulary/[theme]",
                  params: {
                    theme: theme.id,
                    title: theme.title,
                  },
                })
              }
              depth={6}
              pressDepth={3}
              radius={2}
              containerClassName="w-full"
              className="h-48 w-full overflow-hidden p-0"
            >
              {/* IMAGE */}
              <Image
                source={{
                  uri: theme.image,
                }}
                resizeMode="cover"
                style={StyleSheet.absoluteFill}
              />

              {/* IMAGE OVERLAY */}
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.05)",
                  "rgba(0,0,0,0.20)",
                  "rgba(0,0,0,0.78)",
                ]}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
              />

              {/* CONTENT */}
              <View className="flex-1 justify-between p-3">
                {/* ARROW */}
                <View className="items-end">
                  <View className="size-8 items-center justify-center rounded-full bg-black/25">
                    <Text className="text-xl leading-6 text-white">›</Text>
                  </View>
                </View>

                {/* TEXT */}
                <View className="gap-0.5">
                  <Text
                    className="text-base font-bold text-white"
                    numberOfLines={1}
                  >
                    {theme.title}
                  </Text>

                  <Text
                    className="text-xs leading-4 text-white/80"
                    numberOfLines={2}
                  >
                    {theme.description}
                  </Text>
                </View>
              </View>
            </ThreeDCard>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
