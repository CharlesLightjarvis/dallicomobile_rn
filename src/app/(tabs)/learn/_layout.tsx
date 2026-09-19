import { Stack } from "expo-router";

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: false,
        headerTransparent: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Apprendre",
        }}
      />
    </Stack>
  );
}
