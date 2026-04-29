import {
  Add01Icon,
  GridIcon,
  Home01Icon,
  Message01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

import { colors, shadows } from "@sellspace/ui/theme";
import { useUnreadCount } from "@/lib/notifications";

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
        <HugeiconsIcon icon={Add01Icon} size={24} color={colors.accentForeground} />
      </View>
    </Pressable>
  );
}

// ─── Tab bar icon helper ───────────────────────────────────────────────────────

function tabIcon(icon: IconSvgElement, focused: boolean) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={22}
      color={focused ? colors.accent : colors.textMuted}
    />
  );
}

// ─── Inbox icon with unread badge ─────────────────────────────────────────────

function InboxIcon({ focused }: { focused: boolean }) {
  const { count } = useUnreadCount();
  return (
    <View>
      <HugeiconsIcon
        icon={Message01Icon}
        size={22}
        color={focused ? colors.accent : colors.textMuted}
      />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -6,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 3,
          }}
        >
          <Text
            style={{
              fontFamily: "DMSans_700Bold",
              fontSize: 9,
              color: "#fff",
              lineHeight: 12,
            }}
          >
            {count > 9 ? "9+" : count}
          </Text>
        </View>
      )}
    </View>
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
          tabBarIcon: ({ focused }) => <InboxIcon focused={focused} />,
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


import { colors, shadows } from "@sellspace/ui/theme";

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
        <HugeiconsIcon icon={Add01Icon} size={24} color={colors.accentForeground} />
      </View>
    </Pressable>
  );
}

// ─── Tab bar icon helper ───────────────────────────────────────────────────────

function tabIcon(icon: IconSvgElement, focused: boolean) {
  return (
    <HugeiconsIcon
      icon={icon}
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
          tabBarIcon: ({ focused }) => tabIcon(Message01Icon, focused),
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
