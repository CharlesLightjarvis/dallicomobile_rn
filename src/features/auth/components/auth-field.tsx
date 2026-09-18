import { Input } from "heroui-native/input";
import { TextField } from "heroui-native/text-field";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

type AuthFieldProps = ComponentProps<typeof Input> & {
  label: string;
  error?: string;
};

export function AuthField({ label, error, ...props }: AuthFieldProps) {
  return (
    <TextField isInvalid={Boolean(error)}>
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        <Input {...props} isInvalid={Boolean(error)} />
        {error ? <Text className="text-xs text-danger">{error}</Text> : null}
      </View>
    </TextField>
  );
}
