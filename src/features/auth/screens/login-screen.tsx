import { Link } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";

import { AuthField } from "@/features/auth/components/auth-field";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError(undefined);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Connexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-app-background"
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-xl flex-grow justify-center gap-6 px-5 py-10"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Dallico</Text>
          <Text className="text-muted">Connecte-toi pour retrouver ta progression.</Text>
        </View>

        <Card>
          <Card.Body className="gap-4">
            <AuthField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
            />
            <AuthField
              autoCapitalize="none"
              autoComplete="current-password"
              label="Mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text className="text-sm text-danger">{error}</Text> : null}
            <Button isDisabled={isSubmitting || !email || !password} onPress={() => void submit()}>
              {isSubmitting ? "Connexion…" : "Se connecter"}
            </Button>
          </Card.Body>
        </Card>

        <Link href="/(auth)/register" asChild>
          <Button variant="ghost">Créer un compte</Button>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
