import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@sellspace/ui/theme";

export default function NotFound() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        paddingHorizontal: spacing[4],
      }}
    >
      <View style={{ alignItems: "center" }}>
        {/* Icon circle */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.surface2,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing[8],
          }}
        >
          <Text style={{ fontSize: 60, fontWeight: "700" }}>?</Text>
        </View>

        {/* Heading */}
        <Text
          style={{
            ...typography["display-md"],
            color: colors.text,
            marginBottom: spacing[2],
            textAlign: "center",
          }}
        >
          Page not found
        </Text>

        {/* Description */}
        <Text
          style={{
            ...typography["body-md"],
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: spacing[6],
          }}
        >
          The page you're looking for doesn't exist.
        </Text>

        {/* Primary action */}
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={({ pressed }) => ({
            width: "100%",
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            borderRadius: radii.md,
            backgroundColor: colors.accent,
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
            marginBottom: spacing[2],
          })}
        >
          <Text
            style={{
              ...typography["title-md"],
              color: colors.accentForeground,
              fontWeight: "600",
            }}
          >
            Go home
          </Text>
        </Pressable>

        {/* Secondary action */}
        <Pressable
          onPress={() => router.push("/(tabs)/browse")}
          style={({ pressed }) => ({
            width: "100%",
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            borderRadius: radii.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text
            style={{
              ...typography["title-md"],
              color: colors.text,
              fontWeight: "600",
            }}
          >
            Browse listings
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
