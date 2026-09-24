import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledLinearGradient = withUniwind(LinearGradient);
const StyledAnimatedView = withUniwind(Animated.View);

export type BuzzWortStageTone = "buzz" | "success" | "danger" | "bonus";

type BuzzWortStageProps = {
  label: string;
  value: string;
  detail?: string;
  accent: string;
  timeLeft: number;
  maxTime: number;
  effectId: number;
  effectTone: BuzzWortStageTone | null;
};

function colorWithAlpha(color: string, alpha: number) {
  if (!color.startsWith("#") || color.length !== 7) {
    return `rgba(255,183,3,${alpha})`;
  }

  const value = Number.parseInt(color.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}

export function BuzzWortStage({
  label,
  value,
  detail,
  accent,
  timeLeft,
  maxTime,
  effectId,
  effectTone,
}: BuzzWortStageProps) {
  const [idle] = useState(() => new Animated.Value(0));
  const [impact] = useState(() => new Animated.Value(0));
  const progress = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idle, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(idle, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [idle]);

  useEffect(() => {
    if (!effectTone || effectId === 0) return;

    impact.stopAnimation();
    impact.setValue(0);
    Animated.timing(impact, {
      toValue: 1,
      duration: 760,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [effectId, effectTone, impact]);

  const effectColor =
    effectTone === "danger"
      ? "#FB7185"
      : effectTone === "success" || effectTone === "bonus"
        ? "#FACC15"
        : accent;
  const effectText =
    effectTone === "danger"
      ? "RATÉ"
      : effectTone === "success" || effectTone === "bonus"
        ? "+1"
        : "BUZZ";

  return (
    <View className="relative h-[210px] w-[206px] items-center justify-center overflow-visible">
      <StyledAnimatedView
        pointerEvents="none"
        className="absolute h-[184px] w-[184px] rounded-full border border-white/10"
        style={{
          borderColor: colorWithAlpha(accent, 0.22),
          opacity: idle.interpolate({
            inputRange: [0, 1],
            outputRange: [0.35, 0.72],
          }),
          transform: [
            {
              rotate: idle.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "8deg"],
              }),
            },
            {
              scale: idle.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1.04],
              }),
            },
          ],
        }}
      />

      <View className="absolute top-[8px] z-20 w-[154px]">
        <View className="mb-[5px] flex-row items-center justify-between px-[2px]">
          <Text className="text-[9px] font-black tracking-[1px] text-white/55">
            TEMPS DE JEU
          </Text>
          <Text
            className="text-[13px] font-black"
            style={{ color: accent, fontVariant: ["tabular-nums"] }}
          >
            {timeLeft}s
          </Text>
        </View>
        <View className="h-[6px] overflow-hidden rounded-full bg-white/10">
          <View
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: accent }}
          />
        </View>
      </View>

      <StyledLinearGradient
        colors={[colorWithAlpha(accent, 0.94), "#4B4FA3", accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mt-[22px] h-[136px] w-[176px] rounded-[28px] p-[3px]"
        style={{ elevation: 12 }}
      >
        <StyledLinearGradient
          colors={["#282E69", "#171B43", "#10132F"]}
          className="relative flex-1 items-center justify-center overflow-hidden rounded-[25px] px-[14px]"
        >
          <View
            pointerEvents="none"
            className="absolute -top-[30px] h-[92px] w-[150px] rounded-full"
            style={{ backgroundColor: colorWithAlpha(accent, 0.15) }}
          />

          <View className="flex-row items-center gap-[5px]">
            <View className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: accent }} />
            <Text
              numberOfLines={1}
              className="max-w-[128px] text-[8px] font-black tracking-[1.1px] text-white/60"
            >
              {label}
            </Text>
          </View>

          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.52}
            numberOfLines={1}
            className="mt-[5px] max-w-[148px] text-center text-[27px] font-black tracking-[-0.6px] text-white"
          >
            {value}
          </Text>

          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            className="mt-[4px] max-w-[146px] text-center text-[9px] font-bold text-white/45"
          >
            {detail || "Premier au buzz, premier à répondre"}
          </Text>

          <View className="absolute bottom-[9px] flex-row gap-[5px]">
            {[0, 1, 2].map((item) => (
              <View
                key={item}
                className="h-[3px] w-[18px] rounded-full"
                style={{ backgroundColor: item === 0 ? accent : "rgba(255,255,255,0.12)" }}
              />
            ))}
          </View>
        </StyledLinearGradient>
      </StyledLinearGradient>

      {effectTone ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 z-50 items-center justify-center overflow-visible"
          style={{ elevation: 40 }}
        >
          <StyledAnimatedView
            className="absolute h-[116px] w-[116px] rounded-full border-[3px]"
            style={{
              borderColor: effectColor,
              opacity: impact.interpolate({
                inputRange: [0, 0.08, 0.72, 1],
                outputRange: [0, 0.9, 0.45, 0],
              }),
              transform: [
                {
                  scale: impact.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.45, 1.7],
                  }),
                },
              ],
            }}
          />

          <StyledAnimatedView
            className="h-[82px] w-[82px] items-center justify-center rounded-[26px]"
            style={{
              backgroundColor: effectColor,
              elevation: 42,
              opacity: impact.interpolate({
                inputRange: [0, 0.08, 0.78, 1],
                outputRange: [0, 1, 0.95, 0],
              }),
              transform: [
                {
                  translateY: impact.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, -54],
                  }),
                },
                {
                  scale: impact.interpolate({
                    inputRange: [0, 0.22, 1],
                    outputRange: [0.58, 1.08, 1.2],
                  }),
                },
                {
                  rotate: impact.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-8deg", "5deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons
              name={effectTone === "danger" ? "close" : "flash"}
              size={17}
              color="#11142F"
            />
            <Text className="mt-[-2px] text-[23px] font-black text-[#11142F]">
              {effectText}
            </Text>
          </StyledAnimatedView>
        </View>
      ) : null}
    </View>
  );
}
