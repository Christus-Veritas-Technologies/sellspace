import { colors, shadows } from "@sellspace/ui/theme";
import { Add01Icon } from "@hugeicons/react-native";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

import { GridIcon, Home01Icon, MessageIcon, UserIcon } from "@hugeicons/react-native";

// ─── Sell FAB button (center tab) ─────────────────────────────────────────────

function SellFabButton({ onPress }: BottomTabBarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        ...shadows.fab,
        // Position the FAB above the tab bar
        marginBottom: 20,
        alignSelf: "center",
      })}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Add01Icon size={24} color={colors.accentForeground} />
      </View>
    </Pressable>
  );
}

// ─── Tab bar icon helper ───────────────────────────────────────────────────────

function tabIcon(
  IconComponent: React.ComponentType<{ size: number; color: string }>,
  focused: boolean,
) {
  return (
    <IconComponent
      size={22}
      color={focused ? colors.accent : colors.textMuted}
    />
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => tabIcon(Home01Icon, focused),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ focused }) => tabIcon(GridIcon, focused),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "",
          tabBarButton: (props) => <SellFabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ focused }) => tabIcon(MessageIcon, focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => tabIcon(UserIcon, focused),
        }}
      />
    </Tabs>
  );
}
