import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";

export default function LearnLayout() {
  const [backgroundColor, foregroundColor] = useThemeColor([
    "background",
    "foreground",
  ]);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor },
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: foregroundColor,
        headerShadowVisible: false,
        ...(process.env.EXPO_OS === "ios"
          ? {
              headerLargeTitleEnabled: true,
              headerLargeTitleShadowVisible: false,
              headerLargeStyle: { backgroundColor: "transparent" },
              headerTransparent: true,
              headerStyle: { backgroundColor: "transparent" },
            }
          : {
              headerStyle: { backgroundColor },
            }),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Niveaux" }} />
      <Stack.Screen
        name="levels/[level]"
        options={({ route }) => ({
          title: (route.params as { title?: string } | undefined)?.title ?? "Chapitres",
        })}
      />
      <Stack.Screen
        name="chapters/[chapter]"
        options={({ route }) => ({
          title: (route.params as { title?: string } | undefined)?.title ?? "Leçons",
        })}
      />
      <Stack.Screen
        name="lessons/[lesson]"
        options={({ route }) => ({
          headerLargeTitleEnabled: false,
          title: (route.params as { title?: string } | undefined)?.title ?? "Leçon",
        })}
      />
    </Stack>
  );
}
