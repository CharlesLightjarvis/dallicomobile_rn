import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: false,
        headerTransparent: Platform.OS === "ios",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Pratiquer",
        }}
      />
    </Stack>
  );
}
