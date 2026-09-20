import { Text, View } from "react-native";

import { ThreeDCard } from "@/components/ui/three-d-card";

type QuizChoiceState = "idle" | "selected" | "correct" | "incorrect";

type ThreeDQuizChoiceCardProps = {
  letter: string;
  label: string;
  state?: QuizChoiceState;
  disabled?: boolean;
  onPress: () => void;
};

export function ThreeDQuizChoiceCard({
  letter,
  label,
  state = "idle",
  disabled = false,
  onPress,
}: ThreeDQuizChoiceCardProps) {
  const isSelected = state === "selected";
  const isCorrect = state === "correct";
  const isIncorrect = state === "incorrect";

  const depthClassName = isCorrect
    ? "bg-success-depth"
    : isIncorrect
      ? "bg-danger-depth"
      : isSelected
        ? "bg-accent-depth"
        : "bg-card-depth";

  const faceClassName = isCorrect
    ? "border-success bg-success"
    : isIncorrect
      ? "border-danger bg-danger"
      : isSelected
        ? "border-accent bg-accent"
        : "border-border bg-surface";

  const colored = isSelected || isCorrect || isIncorrect;

  return (
    <ThreeDCard
      onPress={onPress}
      disabled={disabled}
      // IMPORTANT :
      // empêche la carte de devenir transparente
      // après validation.
      disabledOpacity={1}
      depth={6}
      pressDepth={3}
      radius={8}
      containerClassName="w-full"
      depthClassName={depthClassName}
      className={`h-[122px] w-full overflow-hidden border p-0 ${faceClassName}`}
    >
      <View className="flex-1 items-center justify-center gap-3 px-3 py-4">
        <View
          className={
            colored
              ? "min-w-8 items-center justify-center bg-white/20 px-2 py-1.5"
              : "min-w-8 items-center justify-center bg-surface-secondary px-2 py-1.5"
          }
          style={{
            borderRadius: 6,
          }}
        >
          <Text
            className={
              colored
                ? "text-xs font-bold text-white"
                : "text-xs font-bold text-foreground"
            }
          >
            {letter}
          </Text>
        </View>

        <Text
          className={
            colored
              ? "text-center text-sm font-semibold leading-5 text-white"
              : "text-center text-sm font-semibold leading-5 text-foreground"
          }
          numberOfLines={3}
        >
          {label}
        </Text>
      </View>
    </ThreeDCard>
  );
}
