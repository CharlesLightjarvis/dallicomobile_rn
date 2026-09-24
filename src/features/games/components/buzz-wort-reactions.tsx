import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

const REACTIONS = [
  { emoji: "😂", x: -12, y: -58 },
  { emoji: "🔥", x: -48, y: -42 },
  { emoji: "😱", x: -62, y: -2 },
];

export function BuzzWortReactions() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    Animated.spring(progress, {
      toValue: next ? 1 : 0,
      damping: 17,
      stiffness: 190,
      mass: 0.55,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    setIsOpen(false);
    Animated.timing(progress, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="h-[40px] w-[40px]">
      {REACTIONS.map((reaction) => (
        <Animated.View
          key={reaction.emoji}
          pointerEvents={isOpen ? "auto" : "none"}
          className="absolute inset-0"
          style={{
            opacity: progress,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, reaction.x],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, reaction.y],
                }),
              },
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
              },
            ],
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Réagir ${reaction.emoji}`}
            onPress={close}
            className="h-[38px] w-[38px] items-center justify-center rounded-full border border-white/15 bg-[#171D3F] active:scale-[1.12]"
            style={{ elevation: 12 }}
          >
            <Text className="text-[18px]">{reaction.emoji}</Text>
          </Pressable>
        </Animated.View>
      ))}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isOpen ? "Fermer les réactions" : "Ouvrir les réactions"}
        onPress={toggle}
        className="absolute inset-0 h-[40px] w-[40px] items-center justify-center rounded-full border border-white/15 bg-[#171D3F] active:scale-[0.94]"
        style={{ elevation: 14 }}
      >
        <Ionicons
          name={isOpen ? "close" : "happy-outline"}
          size={19}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}
