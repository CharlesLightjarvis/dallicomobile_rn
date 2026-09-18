import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Spinner } from "heroui-native/spinner";
import { Text, View } from "react-native";

export function LoadingCard({ label }: { label: string }) {
  return (
    <Card>
      <Card.Body className="items-center gap-3 py-8">
        <Spinner size="lg" />
        <Text className="text-muted">{label}</Text>
      </Card.Body>
    </Card>
  );
}

export function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <Card.Body className="gap-2">
        <Card.Title className="text-danger">Connexion impossible</Card.Title>
        <Card.Description>{message}</Card.Description>
      </Card.Body>
      <Card.Footer>
        <Button className="w-full" variant="secondary" onPress={onRetry}>
          Réessayer
        </Button>
      </Card.Footer>
    </Card>
  );
}

export function EmptyCard({ message }: { message: string }) {
  return (
    <Card>
      <Card.Body>
        <View className="items-center py-4">
          <Text className="text-center text-muted">{message}</Text>
        </View>
      </Card.Body>
    </Card>
  );
}
