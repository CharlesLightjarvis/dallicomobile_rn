import { Card } from "heroui-native/card";
import type { PropsWithChildren } from "react";
import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

type ThreeDCardProps = PropsWithChildren<{
  onPress?: () => void;

  disabled?: boolean;

  /*
   * Géométrie 3D
   */
  depth?: number;
  pressDepth?: number;
  radius?: number;

  /*
   * Classes Uniwind
   */
  className?: string;
  containerClassName?: string;
  depthClassName?: string;

  /*
   * Styles React Native
   */
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  depthStyle?: StyleProp<ViewStyle>;

  /*
   * Couleur directe de la tranche.
   * Si fournie, elle écrase depthClassName.
   */
  depthColor?: string;

  /*
   * Désactive l'animation d'enfoncement
   * tout en gardant le onPress.
   */
  pressEffect?: boolean;

  /*
   * Opacité si disabled.
   */
  disabledOpacity?: number;
}>;

export function ThreeDCard({
  children,

  onPress,
  disabled = false,

  depth = 6,
  pressDepth = 3,
  radius = 2,

  className = "",
  containerClassName = "",
  depthClassName = "bg-card-depth",

  style,
  containerStyle,
  depthStyle,

  depthColor,

  pressEffect = true,

  disabledOpacity = 0.6,
}: ThreeDCardProps) {
  const interactive = Boolean(onPress);

  const renderCard = (pressed = false) => (
    <View
      className={containerClassName}
      style={[
        {
          position: "relative",

          /*
           * Réserve physiquement la place
           * de la tranche inférieure.
           */
          paddingBottom: depth,

          opacity: disabled ? disabledOpacity : 1,
        },

        containerStyle,
      ]}
    >
      {/* ================================= */}
      {/* PROFONDEUR */}
      {/* ================================= */}

      <View
        pointerEvents="none"
        className={depthClassName}
        style={[
          {
            position: "absolute",

            top: depth,
            left: 0,
            right: 0,
            bottom: 0,

            borderRadius: radius,

            ...(depthColor
              ? {
                  backgroundColor: depthColor,
                }
              : null),
          },

          depthStyle,
        ]}
      />

      {/* ================================= */}
      {/* FACE */}
      {/* ================================= */}

      <Card
        className={className}
        style={[
          {
            borderRadius: radius,

            transform: [
              {
                translateY:
                  interactive && pressed && pressEffect && !disabled
                    ? pressDepth
                    : 0,
              },
            ],
          },

          style,
        ]}
      >
        {children}
      </Card>
    </View>
  );

  /*
   * Card non interactive :
   * stats, dashboard, containers...
   */
  if (!interactive) {
    return renderCard(false);
  }

  /*
   * Card interactive :
   * niveaux, chapitres, leçons...
   */
  return (
    <Pressable disabled={disabled} onPress={onPress}>
      {({ pressed }) => renderCard(pressed)}
    </Pressable>
  );
}
