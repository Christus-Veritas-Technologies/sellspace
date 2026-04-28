import { colors } from "@sellspace/ui/theme";
import { View, Text, SafeAreaView } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: "DMSans_600SemiBold",
            fontSize: 18,
            color: colors.text,
          }}
        >
          Profile
        </Text>
        <Text
          style={{
            fontFamily: "DMSans_400Regular",
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 4,
          }}
        >
          Coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
