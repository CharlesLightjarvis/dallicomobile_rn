import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native/provider";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Uniwind, useUniwind } from "uniwind";

import "../global.css";

import { queryClient } from "@/config/query-client";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { AuthProvider } from "@/features/auth/providers/auth-provider";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

const heroUIConfig = {
  devInfo: {
    stylingPrinciples: false,
    toast: {
      defaultProps: {
        placement: "top",
        isSwipeable: true,
      },

      insets: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
  },
} as const;

function AppNavigator() {
  const { user, isReady } = useAuth();
  const { theme } = useUniwind();
  const navigationTheme = theme === "dark" ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (isReady) SplashScreen.hide();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerLargeTitleEnabled: false,
          headerTransparent: Platform.OS === "ios",
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={Boolean(user)}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="learn/levels/[level]"
            options={({ route }) => {
              const params = route.params as
                | {
                    level?: string;
                  }
                | undefined;

              return {
                title: params?.level
                  ? `Niveau ${params.level.toUpperCase()}`
                  : "Niveau",
              };
            }}
          />

          <Stack.Screen
            name="learn/chapters/[chapter]"
            options={({ route }) => {
              const params = route.params as
                | {
                    title?: string;
                  }
                | undefined;

              return {
                title: params?.title ?? "Chapitre",
              };
            }}
          />

          <Stack.Screen
            name="learn/lessons/[lesson]"
            options={({ route }) => {
              const params = route.params as
                | {
                    title?: string;
                  }
                | undefined;

              return {
                title: params?.title ?? "Leçon",
              };
            }}
          />

          <Stack.Screen
            name="learn/quiz/[lesson]"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name="practice/vocabulary/index"
            options={{
              title: "Vocabulaire",
            }}
          />

          <Stack.Screen
            name="practice/vocabulary/[theme]"
            options={({ route }) => {
              const params = route.params as
                | {
                    title?: string;
                  }
                | undefined;

              return {
                title: params?.title ?? "Vocabulaire",
              };
            }}
          />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    Uniwind.setTheme("system");
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <HeroUINativeProvider config={heroUIConfig}>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </HeroUINativeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
