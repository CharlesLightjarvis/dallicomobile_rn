import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "heroui-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from "react-native";

type GameButtonVariant =
  | "accent"
  | "danger"
  | "success"
  | "warning"
  | "default";

type GameButtonProps = {
  title: string;
  variant?: GameButtonVariant;
  onPress: () => void;

  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";

  loading?: boolean;
  loadingText?: string;

  disabled?: boolean;

  haptic?: "Light" | "Medium" | "Heavy";

  height?: number;
};

const BORDER_RADIUS = 1.6; // ≈ 0.1rem
const DEPTH = 6;

export function GameButton({
  title,
  variant = "accent",
  onPress,

  icon,
  iconPosition = "right",

  loading = false,
  loadingText,

  disabled = false,

  haptic = "Medium",

  height = 54,
}: GameButtonProps) {
  /*
   * HEROUI TOKENS
   */
  const accent = useThemeColor("accent");
  const accentForeground = useThemeColor("accent-foreground");

  const danger = useThemeColor("danger");
  const dangerForeground = useThemeColor("danger-foreground");

  const success = useThemeColor("success");
  const successForeground = useThemeColor("success-foreground");

  const warning = useThemeColor("warning");
  const warningForeground = useThemeColor("warning-foreground");

  const defaultColor = useThemeColor("default");
  const defaultForeground = useThemeColor("default-foreground");

  const variants = {
    accent: {
      background: accent,
      foreground: accentForeground,
    },

    danger: {
      background: danger,
      foreground: dangerForeground,
    },

    success: {
      background: success,
      foreground: successForeground,
    },

    warning: {
      background: warning,
      foreground: warningForeground,
    },

    default: {
      background: defaultColor,
      foreground: defaultForeground,
    },
  } as const;

  const colors = variants[variant];

  /*
   * 3D PRESS
   */
  const [pressY] = useState(() => new Animated.Value(0));

  const locked = useRef(false);

  const handlePressIn = () => {
    if (disabled || loading) return;

    const hapticMap = {
      Light: Haptics.ImpactFeedbackStyle.Light,
      Medium: Haptics.ImpactFeedbackStyle.Medium,
      Heavy: Haptics.ImpactFeedbackStyle.Heavy,
    } as const;

    void Haptics.impactAsync(hapticMap[haptic]);

    Animated.spring(pressY, {
      toValue: DEPTH,
      stiffness: 300,
      damping: 20,
      mass: 0.4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.spring(pressY, {
      toValue: 0,
      stiffness: 300,
      damping: 20,
      mass: 0.4,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading || locked.current) {
      return;
    }

    locked.current = true;

    onPress();

    setTimeout(() => {
      locked.current = false;
    }, 250);
  };

  return (
    <View
      style={{
        position: "relative",
        width: "100%",

        // réserve la profondeur
        paddingBottom: DEPTH,

        opacity: disabled || loading ? 0.6 : 1,
      }}
    >
      {/* ============================== */}
      {/* PROFONDEUR 3D */}
      {/* ============================== */}

      <View
        pointerEvents="none"
        style={{
          position: "absolute",

          top: DEPTH,
          left: 0,
          right: 0,

          height,

          borderRadius: BORDER_RADIUS,

          backgroundColor: colors.background,

          overflow: "hidden",
        }}
      >
        {/*
         * On assombrit dynamiquement la couleur HeroUI.
         *
         * Donc :
         * accent -> accent sombre
         * danger -> danger sombre
         * success -> success sombre
         *
         * Pas besoin de hardcoder les couleurs.
         */}
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.22)",
          }}
        />
      </View>

      {/* ============================== */}
      {/* FACE DU BOUTON */}
      {/* ============================== */}

      <Pressable
        disabled={disabled || loading}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
      >
        <Animated.View
          style={{
            height,

            borderRadius: BORDER_RADIUS,

            backgroundColor: colors.background,

            alignItems: "center",
            justifyContent: "center",

            paddingHorizontal: 18,

            transform: [
              {
                translateY: pressY,
              },
            ],
          }}
        >
          <View className="flex-row items-center justify-center gap-2">
            {/* ICON LEFT */}

            {!loading && icon && iconPosition === "left" ? (
              <Ionicons name={icon} size={18} color={colors.foreground} />
            ) : null}

            {/* LOADING */}

            {loading ? (
              <>
                <ActivityIndicator size="small" color={colors.foreground} />

                {loadingText ? (
                  <Text
                    style={{
                      color: colors.foreground,
                    }}
                    className="text-[15px] font-bold"
                  >
                    {loadingText}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text
                style={{
                  color: colors.foreground,
                }}
                className="text-[15px] font-bold"
              >
                {title}
              </Text>
            )}

            {/* ICON RIGHT */}

            {!loading && icon && iconPosition === "right" ? (
              <Ionicons name={icon} size={18} color={colors.foreground} />
            ) : null}
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
