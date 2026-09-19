import { Stack } from "expo-router";

export default function PracticeLayout() {
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
          title: "Pratiquer",
        }}
      />
    </Stack>
  );
}
