import { useEffect, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

export type BuzzWortHistoryEvent = {
  id: number;
  text: string;
  tone: "neutral" | "buzz" | "success" | "danger" | "bonus";
};

function HistoryLine({
  event,
  age,
}: {
  event: BuzzWortHistoryEvent;
  age: number;
}) {
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const color =
    event.tone === "success"
      ? "#86EFAC"
      : event.tone === "danger"
        ? "#FDA4AF"
        : event.tone === "buzz"
          ? "#FDE68A"
          : event.tone === "bonus"
            ? "#C4B5FD"
            : "#FFFFFF";

  return (
    <Animated.View
      className="items-center"
      style={{
        opacity: Animated.multiply(entrance, Math.max(0.16, 1 - age * 0.24)),
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [9, 0],
            }),
          },
        ],
      }}
    >
      <Text
        numberOfLines={1}
        className="max-w-[260px] text-center font-bold"
        style={{
          color,
          fontSize: age === 0 ? 11 : age === 1 ? 10 : 9,
          textShadowColor: "rgba(0,0,0,0.8)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {event.text}
      </Text>
    </Animated.View>
  );
}

export function BuzzWortHistoryFeed({
  events,
}: {
  events: BuzzWortHistoryEvent[];
}) {
  const visible = events.slice(-4);

  return (
    <View className="flex-1 justify-start gap-[4px] overflow-hidden pt-[3px]">
      {visible.map((event, index) => (
        <HistoryLine
          key={event.id}
          event={event}
          age={visible.length - index - 1}
        />
      ))}
    </View>
  );
}
