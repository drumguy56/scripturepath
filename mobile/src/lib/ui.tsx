import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { colors, fonts } from './theme';

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <Text style={styles.error}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonGhost,
        (disabled || pressed) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.buttonText, { color: primary ? colors.primaryInk : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export const inputStyle = {
  backgroundColor: colors.card,
  borderColor: colors.border,
  borderWidth: StyleSheet.hairlineWidth,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 13,
  fontSize: 16,
  color: colors.ink,
  marginBottom: 12,
};

export const styles = StyleSheet.create({
  eyebrow: { color: colors.muted, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 },
  title: { color: colors.ink, fontFamily: fonts.serif, fontSize: 28, lineHeight: 34, marginBottom: 8 },
  body: { color: colors.ink, fontSize: 16, lineHeight: 25 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 18,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  error: { color: colors.danger, fontSize: 14, marginTop: 8 },
  button: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonGhost: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.card },
  buttonText: { fontSize: 16, fontWeight: '600' },
});

export const formStyles = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 48, backgroundColor: colors.background, flexGrow: 1 },
  link: { color: colors.primary, textAlign: 'center', fontSize: 15, paddingVertical: 4 },
});
