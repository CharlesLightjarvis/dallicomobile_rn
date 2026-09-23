import { useEffect, useState } from "react";
import { Animated, Text, View } from "react-native";

export type BuzzWortHistoryEvent = {
  id: number;
  text: string;
  tone?: "default" | "success" | "danger";
};

function HistoryItem({ event }: { event: BuzzWortHistoryEvent }) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(12));

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2550),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY]);

  const color =
    event.tone === "success"
      ? "text-[#06D6A0]"
      : event.tone === "danger"
        ? "text-[#EF476F]"
        : "text-white/65";

  return (
    <Animated.View
      className="items-center"
      style={{ opacity, transform: [{ translateY }] }}
    >
      <Text className={`text-[11px] font-semibold ${color}`}>{event.text}</Text>
    </Animated.View>
  );
}

export function BuzzWortHistoryFeed({
  events,
}: {
  events: BuzzWortHistoryEvent[];
}) {
  return (
    <View className="h-16 justify-end gap-1 overflow-hidden px-2">
      {events.slice(-3).map((event) => (
        <HistoryItem key={event.id} event={event} />
      ))}
    </View>
  );
}
