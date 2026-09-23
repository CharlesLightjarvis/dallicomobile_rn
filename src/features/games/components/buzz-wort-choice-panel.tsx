import { Pressable, Text, View } from "react-native";

type BuzzWortChoicePanelProps = {
  title: string;
  choices: string[];
  selectedChoice: string | null;
  disabled?: boolean;
  onSelect: (choice: string) => void;
  onValidate: () => void;
};

export function BuzzWortChoicePanel({
  title,
  choices,
  selectedChoice,
  disabled = false,
  onSelect,
  onValidate,
}: BuzzWortChoicePanelProps) {
  return (
    <View className="gap-3">
      <Text className="text-center text-sm font-bold text-white/80">{title}</Text>

      <View className="flex-row flex-wrap justify-center gap-2">
        {choices.map((choice) => {
          const selected = selectedChoice === choice;

          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              className={`min-w-[45%] rounded-2xl border px-3 py-3 ${selected ? "border-[#F4C95D] bg-[#F4C95D]/20" : "border-white/10 bg-white/10"}`}
              disabled={disabled}
              onPress={() => onSelect(choice)}
            >
              <Text className="text-center text-sm font-bold text-white">
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        className="items-center rounded-2xl bg-[#F4C95D] px-4 py-3 active:opacity-80"
        disabled={!selectedChoice || disabled}
        onPress={onValidate}
      >
        <Text className="font-black tracking-wide text-[#101426]">VALIDER</Text>
      </Pressable>
    </View>
  );
}
