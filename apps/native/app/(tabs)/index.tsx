import { colors } from "@sellspace/ui/theme";
import { View, Text, SafeAreaView } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: "Fraunces_700Bold",
            fontSize: 28,
            color: colors.primary,
          }}
        >
          sell<Text style={{ color: colors.accent }}>space</Text>
        </Text>
        <Text
          style={{
            fontFamily: "DMSans_400Regular",
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 8,
          }}
        >
          Zimbabwe's marketplace built on trust
        </Text>
      </View>
    </SafeAreaView>
  );
}
