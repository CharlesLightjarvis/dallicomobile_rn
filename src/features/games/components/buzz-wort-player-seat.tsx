import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { BuzzWortPlayer } from "../types/buzz-wort";

type BuzzWortPlayerSeatProps = {
  player: BuzzWortPlayer;
  score: number;
  position: "top" | "left" | "right" | "bottom";
  isActive: boolean;
  isLocked: boolean;
  isLocal: boolean;
  onBuzz: () => void;
};

export function BuzzWortPlayerSeat({
  player,
  score,
  position,
  isActive,
  isLocked,
  isLocal,
  onBuzz,
}: BuzzWortPlayerSeatProps) {
  const isSide = position === "left" || position === "right";
  const isDisabled = isLocked || isActive;

  const identity = (
    <View className={`items-center gap-1 ${isLocked ? "opacity-45" : "opacity-100"}`}>
      <View className="relative">
        {isActive ? (
          <View className="absolute -inset-1 rounded-full bg-[#F4C95D]/40" />
        ) : null}

        <View
          className={`relative size-12 items-center justify-center rounded-full border-2 ${isActive ? "border-[#F4C95D]" : "border-white/20"}`}
          style={{ backgroundColor: player.color }}
        >
          <Ionicons name={player.avatarIcon} size={25} color="#101426" />
        </View>

        <View className="absolute -right-3 -top-2 min-w-7 items-center rounded-full border border-white/15 bg-[#171D3F] px-1.5 py-0.5">
          <Text className="text-[10px] font-black tabular-nums text-[#F4C95D]">
            {score}
          </Text>
        </View>
      </View>

      <Text className="max-w-20 text-center text-xs font-bold text-white" numberOfLines={1}>
        {isLocal ? "TOI" : player.name}
      </Text>

      {isActive ? (
        <View className="rounded-full bg-[#F4C95D] px-2 py-1">
          <Text className="text-[8px] font-black tracking-wide text-[#101426]">
            À LA MAIN
          </Text>
        </View>
      ) : isLocked ? (
        <Text className="text-[9px] font-semibold text-white/35">PASSÉ</Text>
      ) : null}
    </View>
  );

  return (
    <View className={isSide ? "w-[25%]" : "items-center"}>
      {isLocal ? (
        identity
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Simuler le buzz de ${player.name}`}
          disabled={isDisabled}
          onPress={onBuzz}
        >
          {identity}
        </Pressable>
      )}

      {isLocal && !isDisabled ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buzzer"
          className="mt-3 size-[68px] items-center justify-center rounded-full border-4 border-[#B33D51] bg-[#E05A68] active:translate-y-1"
          onPress={onBuzz}
        >
          <Text className="text-[11px] font-black tracking-[2px] text-white">BUZZ</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
