import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const REACTIONS = ["😂", "🔥", "😱"];

export function BuzzWortReactions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="items-end">
      {isOpen ? (
        <View className="absolute bottom-12 right-0 items-center gap-2">
          {REACTIONS.map((reaction) => (
            <Pressable
              key={reaction}
              accessibilityRole="button"
              accessibilityLabel={`Réagir ${reaction}`}
              className="size-9 items-center justify-center rounded-full border border-white/15 bg-[#1B2149]"
              onPress={() => setIsOpen(false)}
            >
              <Text className="text-lg">{reaction}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvrir les réactions"
        className="size-11 items-center justify-center rounded-full border border-white/20 bg-[#1B2149]"
        onPress={() => setIsOpen((value) => !value)}
      >
        <Text className="text-xl">😄</Text>
      </Pressable>
    </View>
  );
}
