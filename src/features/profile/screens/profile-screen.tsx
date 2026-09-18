import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { ScrollView, Text, View } from "react-native";

import { useAuth } from "@/features/auth/hooks/use-auth";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4 pt-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="items-center gap-3">
        <View className="size-20 items-center justify-center rounded-full bg-accent-soft">
          <Text className="text-2xl font-bold text-accent">{user?.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text className="text-2xl font-bold text-foreground">{user?.name}</Text>
        <Text className="text-sm text-muted">{user?.email}</Text>
        <Chip color="accent" size="sm" variant="soft"><Chip.Label>Apprenant</Chip.Label></Chip>
      </View>
      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Session sécurisée</Card.Title>
          <Card.Description>Ton jeton est conservé dans le stockage sécurisé du téléphone.</Card.Description>
        </Card.Body>
      </Card>
      <Button variant="danger-soft" onPress={() => void logout()}>Se déconnecter</Button>
    </ScrollView>
  );
}
