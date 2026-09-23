import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledLinearGradient = withUniwind(LinearGradient);
const StyledAnimatedView = withUniwind(Animated.View);

type GameBuzzerVariant = "red" | "amber" | "violet" | "cyan";

type GameBuzzerProps = {
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  variant?: GameBuzzerVariant;
};

const PRESS_DEPTH = 7;

const PALETTES: Record<
  GameBuzzerVariant,
  {
    side: [string, string, string];
    dome: [string, string, string, string];
    border: string;
    glow: string;
  }
> = {
  red: {
    side: ["#650006", "#A5000C", "#420003"],
    dome: ["#FF676B", "#F4141C", "#C5000A", "#850006"],
    border: "#FF686D",
    glow: "rgba(255,35,45,0.32)",
  },
  amber: {
    side: ["#7A4300", "#B96500", "#5A2C00"],
    dome: ["#FFE066", "#FFB703", "#F58B00", "#A94F00"],
    border: "#FFE27A",
    glow: "rgba(255,183,3,0.30)",
  },
  violet: {
    side: ["#32156D", "#5620A8", "#211047"],
    dome: ["#C4B5FD", "#8B5CF6", "#6D28D9", "#40128C"],
    border: "#C4B5FD",
    glow: "rgba(139,92,246,0.30)",
  },
  cyan: {
    side: ["#005A6B", "#007E95", "#003B47"],
    dome: ["#67E8F9", "#22D3EE", "#06B6D4", "#08758A"],
    border: "#A5F3FC",
    glow: "rgba(34,211,238,0.30)",
  },
};

export function GameBuzzer({
  onPress,
  disabled = false,
  size = 128,
  variant = "red",
}: GameBuzzerProps) {
  const pressY = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const palette = PALETTES[variant];

  const handlePressIn = () => {
    if (disabled) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.parallel([
      Animated.spring(pressY, {
        toValue: PRESS_DEPTH,
        stiffness: 420,
        damping: 24,
        mass: 0.4,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 0.97,
        stiffness: 420,
        damping: 24,
        mass: 0.4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    Animated.parallel([
      Animated.spring(pressY, {
        toValue: 0,
        stiffness: 360,
        damping: 18,
        mass: 0.45,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        stiffness: 360,
        damping: 18,
        mass: 0.45,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const baseSize = size;
  const innerBaseSize = size * 0.88;
  const buttonSize = size * 0.68;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Buzzer"
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={["items-center justify-center", disabled && "opacity-50"]
        .filter(Boolean)
        .join(" ")}
    >
      <View
        className="relative items-center justify-center"
        style={{
          width: baseSize,
          height: baseSize + PRESS_DEPTH,
        }}
      >
        <View
          pointerEvents="none"
          className="absolute bottom-[0px] rounded-full bg-black/55"
          style={{
            width: baseSize * 0.82,
            height: baseSize * 0.22,
            transform: [{ scaleX: 1.12 }],
          }}
        />

        <View
          pointerEvents="none"
          className="absolute rounded-full"
          style={{
            width: baseSize * 0.92,
            height: baseSize * 0.92,
            backgroundColor: palette.glow,
          }}
        />

        <StyledLinearGradient
          pointerEvents="none"
          colors={["#090A0D", "#242730", "#08090C"]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          className="absolute items-center justify-center rounded-full border border-white/10"
          style={{
            width: baseSize,
            height: baseSize,
          }}
        >
          <View className="absolute top-[7%] left-[19%] right-[19%] h-[10%] rounded-full bg-white/[0.07]" />

          <StyledLinearGradient
            colors={["#353943", "#111319", "#050609"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            className="items-center justify-center rounded-full border border-black/80"
            style={{
              width: innerBaseSize,
              height: innerBaseSize,
            }}
          >
            <View
              className="absolute rounded-full bg-black/80"
              style={{
                width: buttonSize + 14,
                height: buttonSize + 14,
              }}
            />

            <StyledAnimatedView
              className="items-center justify-center"
              style={{
                transform: [{ translateY: pressY }, { scale: pressScale }],
              }}
            >
              <StyledLinearGradient
                colors={palette.side}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute top-[5px] rounded-full"
                style={{
                  width: buttonSize,
                  height: buttonSize,
                }}
              />

              <StyledLinearGradient
                colors={palette.dome}
                locations={[0, 0.34, 0.72, 1]}
                start={{ x: 0.28, y: 0 }}
                end={{ x: 0.72, y: 1 }}
                className="relative overflow-hidden rounded-full border"
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderColor: palette.border,
                }}
              >
                <View
                  pointerEvents="none"
                  className="absolute bg-white/35 rounded-full"
                  style={{
                    width: buttonSize * 0.48,
                    height: buttonSize * 0.2,
                    top: buttonSize * 0.1,
                    left: buttonSize * 0.16,
                    transform: [{ rotate: "-18deg" }],
                  }}
                />

                <View
                  pointerEvents="none"
                  className="absolute bg-white/45 rounded-full"
                  style={{
                    width: buttonSize * 0.13,
                    height: buttonSize * 0.08,
                    top: buttonSize * 0.19,
                    left: buttonSize * 0.21,
                    transform: [{ rotate: "-20deg" }],
                  }}
                />

                <StyledLinearGradient
                  pointerEvents="none"
                  colors={["transparent", "rgba(0,0,0,0.35)"]}
                  className="absolute inset-0 rounded-full"
                />

                <View
                  pointerEvents="none"
                  className="absolute left-[6%] top-[28%] bottom-[22%] w-[5%] rounded-full bg-white/15"
                />
              </StyledLinearGradient>
            </StyledAnimatedView>
          </StyledLinearGradient>
        </StyledLinearGradient>

        <View
          pointerEvents="none"
          className="absolute bg-black/25 rounded-full"
          style={{
            width: buttonSize * 0.77,
            height: buttonSize * 0.12,
            bottom: size * 0.12,
          }}
        />
      </View>
    </Pressable>
  );
}
