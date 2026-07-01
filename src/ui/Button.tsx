import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

/** 最小の再利用ボタン。実際に使うパターンだけ増やす (docs/patterns/implementation-patterns.md #まだ作らない)。 */
export function Button({ label, onPress, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === "secondary" && styles.secondary,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#208AEF",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryLabel: {
    color: "#208AEF",
  },
});
