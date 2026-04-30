import { useState } from "react";
import { Image, Text, View } from "react-native";
import { colors } from "@sellspace/ui/theme";

interface AvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: number;
}

function initials(name: string | null): string {
  if (!name) return "?";
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function Avatar({ name, avatarUrl, size = 40 }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const abbr = initials(name);
  const fontSize = Math.max(10, Math.round(size * 0.36));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      accessible
      accessibilityLabel={name ?? "User avatar"}
      accessibilityRole="image"
    >
      {avatarUrl && !imgError ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setImgError(true)}
        />
      ) : (
        <Text
          style={{
            fontFamily: "Fraunces_700Bold",
            fontSize,
            color: "#FAFAF8",
            lineHeight: Math.round(fontSize * 1.2),
          }}
        >
          {abbr}
        </Text>
      )}
    </View>
  );
}
