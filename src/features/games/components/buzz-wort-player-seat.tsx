import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

import type { BuzzWortPlayer } from "../types/buzz-wort";

const StyledLinearGradient = withUniwind(LinearGradient);
const StyledAnimatedView = withUniwind(Animated.View);

type BuzzWortPlayerSeatProps = {
  player: BuzzWortPlayer;
  score: number;
  position: "top" | "left" | "right" | "bottom";
  isActive: boolean;
  isLocked: boolean;
  isLocal: boolean;
  timeLeft: number;
  maxTime?: number;
  onBuzz: () => void;
};

export function BuzzWortPlayerSeat({
  player,
  score,
  position,
  isActive,
  isLocked,
  isLocal,
  timeLeft,
  maxTime = 15,
  onBuzz,
}: BuzzWortPlayerSeatProps) {
  const [pulse] = useState(() => new Animated.Value(0));
  const size = isLocal ? 54 : position === "top" ? 42 : 48;
  const progress = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

  useEffect(() => {
    if (!isActive) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 620,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 620,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [isActive, pulse]);

  const content = (
    <View className="items-center">
      <View className="relative items-center justify-center">
        {isActive ? (
          <StyledAnimatedView
            pointerEvents="none"
            className="absolute rounded-full"
            style={{
              width: size + 18,
              height: size + 18,
              backgroundColor: player.color,
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.18, 0.48],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1.08],
                  }),
                },
              ],
            }}
          />
        ) : null}

        {isActive ? (
          <View
            className="absolute z-20 h-[5px] overflow-hidden rounded-full bg-white/15"
            style={{ top: -11, width: size + 12 }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: player.color }}
            />
          </View>
        ) : null}

        <StyledLinearGradient
          colors={
            isActive
              ? [player.color, "#FFFFFF", player.color]
              : ["rgba(255,255,255,0.34)", player.color, "rgba(0,0,0,0.5)"]
          }
          className="items-center justify-center rounded-full p-[2px]"
          style={{
            width: size,
            height: size,
            opacity: isLocked ? 0.42 : 1,
            elevation: isActive ? 12 : 3,
          }}
        >
          <View className="h-full w-full items-center justify-center rounded-full bg-[#11162D]">
            <Ionicons
              name={player.avatarIcon}
              size={Math.round(size * 0.48)}
              color={isLocked ? "#70758B" : player.color}
            />
          </View>
        </StyledLinearGradient>

        <View
          className="absolute -right-[9px] -top-[5px] min-w-[25px] items-center rounded-full border border-white/15 bg-[#080B19] px-[6px] py-[2px]"
          style={{ elevation: 14 }}
        >
          <Text
            className="text-[10px] font-black text-white"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {score}
          </Text>
        </View>
      </View>

      <View className="mt-[5px] h-[20px] items-center justify-center">
        {isActive ? (
          <View
            className="rounded-full px-[9px] py-[3px]"
            style={{ backgroundColor: player.color }}
          >
            <Text className="text-[8px] font-black tracking-[0.7px] text-[#090C1C]">
              {isLocal ? "À TON TOUR" : "SON TOUR"}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-[4px]">
            <View
              className="h-[5px] w-[5px] rounded-full"
              style={{ backgroundColor: isLocked ? "#6B7280" : "#65E572" }}
            />
            <Text
              numberOfLines={1}
              className="max-w-[72px] text-[10px] font-bold text-white/75"
            >
              {isLocal ? "Toi" : player.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLocal) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Simuler le buzz de ${player.name}`}
      disabled={isLocked || isActive}
      onPress={onBuzz}
      className="active:scale-[0.96]"
    >
      {content}
    </Pressable>
  );
}
