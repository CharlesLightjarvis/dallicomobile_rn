import { Link } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";

import { AuthField } from "@/features/auth/components/auth-field";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError(undefined);
    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmation,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Inscription impossible.");
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
          <Text className="text-3xl font-bold text-foreground">Créer un compte</Text>
          <Text className="text-muted">Ta progression sera synchronisée avec Laravel.</Text>
        </View>
        <Card>
          <Card.Body className="gap-4">
            <AuthField autoComplete="name" label="Nom" value={name} onChangeText={setName} />
            <AuthField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="E-mail" value={email} onChangeText={setEmail} />
            <AuthField autoCapitalize="none" autoComplete="new-password" label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
            <AuthField autoCapitalize="none" autoComplete="new-password" label="Confirmation" secureTextEntry value={confirmation} onChangeText={setConfirmation} />
            {error ? <Text className="text-sm text-danger">{error}</Text> : null}
            <Button isDisabled={isSubmitting || !name || !email || password.length < 8} onPress={() => void submit()}>
              {isSubmitting ? "Création…" : "Créer mon compte"}
            </Button>
          </Card.Body>
        </Card>
        <Link href="/(auth)/login" asChild>
          <Button variant="ghost">J’ai déjà un compte</Button>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
