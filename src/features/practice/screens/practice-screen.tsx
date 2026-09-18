import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { ScrollView, Text, View } from "react-native";

export function PracticeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-app-background"
      contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-2">
        <Chip className="self-start" color="success" size="sm" variant="soft">
          <Chip.Label>En préparation</Chip.Label>
        </Chip>
        <Text selectable className="text-3xl font-bold text-foreground">
          Pratiquer
        </Text>
        <Text selectable className="text-base leading-6 text-muted">
          Retrouve bientôt ici les quiz, exercices et entraînements rapides.
        </Text>
      </View>

      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Exercices ciblés</Card.Title>
          <Card.Description>
            Les exercices seront reliés aux leçons et à tes erreurs fréquentes.
          </Card.Description>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
