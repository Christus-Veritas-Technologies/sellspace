import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import { authApi, tokenStorage } from "@/lib/auth";

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const { email = "" } = useLocalSearchParams<{ email: string }>();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [apiError, setApiError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const mutation = useMutation({
    mutationFn: (otp: string) => authApi.verifyOtp(email as string, otp),
    onSuccess: async (data) => {
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      router.replace("/(tabs)");
    },
    onError: (err: Error) => {
      setApiError(err.message);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    },
  });

  function handleChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setApiError("");

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = next.join("");
    if (otp.length === OTP_LENGTH && !next.includes("")) {
      mutation.mutate(otp);
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: spacing[4] }}>
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: spacing[8] }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 36, color: colors.primary }}>
              sell<Text style={{ color: colors.accent }}>space</Text>
            </Text>
          </View>

          {/* Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[6],
              ...shadows.modal,
            }}
          >
            <Text
              style={{ fontFamily: "DMSans_700Bold", fontSize: 18, color: colors.text, marginBottom: spacing[1] }}
            >
              Enter your code
            </Text>
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 14,
                color: colors.textMuted,
                marginBottom: spacing[5],
              }}
            >
              We sent a 6-digit code to{" "}
              <Text style={{ fontFamily: "DMSans_700Bold", color: colors.text }}>
                {email}
              </Text>
              . Expires in 10 minutes.
            </Text>

            {/* OTP digit inputs */}
            <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing[2], marginBottom: spacing[4] }}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={digit}
                  onChangeText={(v) => handleChange(i, v)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!mutation.isPending}
                  style={{
                    width: 44,
                    height: 52,
                    textAlign: "center",
                    fontFamily: "DMSans_700Bold",
                    fontSize: 22,
                    color: colors.text,
                    backgroundColor: colors.surface2,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderColor: apiError
                      ? colors.destructive
                      : digit
                      ? colors.accent
                      : colors.border,
                  }}
                />
              ))}
            </View>

            {apiError ? (
              <Text
                style={{
                  fontFamily: "DMSans_400Regular",
                  fontSize: 12,
                  color: colors.destructive,
                  textAlign: "center",
                  marginBottom: spacing[3],
                }}
              >
                {apiError}
              </Text>
            ) : null}

            {mutation.isPending ? (
              <Text
                style={{
                  fontFamily: "DMSans_400Regular",
                  fontSize: 12,
                  color: colors.textMuted,
                  textAlign: "center",
                  marginBottom: spacing[3],
                }}
              >
                Verifying…
              </Text>
            ) : null}

            {/* Back link */}
            <Pressable onPress={() => router.back()} style={{ alignItems: "center", marginTop: spacing[2] }}>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted }}>
                Wrong email?{" "}
                <Text style={{ fontFamily: "DMSans_700Bold", color: colors.accent }}>Go back</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
