import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect } from "react";
import { Platform } from "react-native";

import { env } from "@sellspace/env/native";

import { tokenStorage } from "@/lib/auth";

// ─── Notification handler (foreground display) ────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Context ─────────────────────────────────────────────────────────────────

const PushNotificationsContext = createContext<null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    void registerForPushNotifications();

    // Handle tapping a notification while app is backgrounded/closed
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url as
          | string
          | undefined;
        if (url) {
          router.push(url as Parameters<typeof router.push>[0]);
        }
      },
    );

    return () => {
      responseSub.remove();
    };
  }, [router]);

  return (
    <PushNotificationsContext.Provider value={null}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

// ─── Push registration logic ──────────────────────────────────────────────────

async function registerForPushNotifications(): Promise<void> {
  // Push notifications are not supported on web in this context
  if (Platform.OS === "web") return;

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;

    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) return;

    const base = env.EXPO_PUBLIC_SERVER_URL.replace(/\/$/, "");
    await fetch(`${base}/api/push/native`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token: expoPushToken }),
    });
  } catch {
    // Non-fatal — push is best-effort
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePushNotifications() {
  return useContext(PushNotificationsContext);
}
