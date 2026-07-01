import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

/** 最小の再利用ボタン。実際に使うパターンだけ増やす (docs/patterns/implementation-patterns.md #まだ作らない)。 */
export function Button({ label, onPress, variant = "primary" }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, variant === "secondary" && styles.secondary]}
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
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryLabel: {
    color: "#208AEF",
  },
});
