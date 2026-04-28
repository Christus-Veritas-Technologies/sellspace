import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { authApi } from "@/lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [inputError, setInputError] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.requestOtp(email.trim()),
    onSuccess: () => {
      router.push({ pathname: "/(auth)/verify", params: { email: email.trim() } });
    },
    onError: (err: Error) => {
      setInputError(err.message);
    },
  });

  function handleSubmit() {
    setInputError("");
    const trimmed = email.trim();

    if (!trimmed) {
      setInputError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setInputError("Enter a valid email address.");
      return;
    }

    mutation.mutate();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: spacing[4],
          }}
        >
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: spacing[8] }}>
            <Text
              style={{
                fontFamily: "Fraunces_700Bold",
                fontSize: 36,
                color: colors.primary,
              }}
            >
              sell
              <Text style={{ color: colors.accent }}>space</Text>
            </Text>
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 14,
                color: colors.textMuted,
                marginTop: spacing[1],
              }}
            >
              Zimbabwe&apos;s marketplace built on trust
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
              style={{
                fontFamily: "DMSans_700Bold",
                fontSize: 18,
                color: colors.text,
                marginBottom: spacing[1],
              }}
            >
              Sign in
            </Text>
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 14,
                color: colors.textMuted,
                marginBottom: spacing[5],
              }}
            >
              Enter your email to receive a sign-in code.
            </Text>

            {/* Email input */}
            <Text
              style={{
                fontFamily: "DMSans_500Medium",
                fontSize: 13,
                color: colors.text,
                marginBottom: spacing[1],
              }}
            >
              Email address
            </Text>
            <TextInput
              value={email}
              onChangeText={(v) => { setEmail(v); setInputError(""); }}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!mutation.isPending}
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 14,
                color: colors.text,
                backgroundColor: colors.surface2,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: inputError ? colors.destructive : colors.border,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[3],
                marginBottom: spacing[1],
              }}
            />

            {inputError ? (
              <Text
                style={{
                  fontFamily: "DMSans_400Regular",
                  fontSize: 12,
                  color: colors.destructive,
                  marginBottom: spacing[3],
                }}
              >
                {inputError}
              </Text>
            ) : (
              <View style={{ height: spacing[3] }} />
            )}

            {/* Submit button */}
            <Pressable
              onPress={handleSubmit}
              disabled={mutation.isPending}
              style={({ pressed }) => ({
                backgroundColor: colors.accent,
                borderRadius: radii.md,
                paddingVertical: spacing[3],
                alignItems: "center",
                opacity: pressed || mutation.isPending ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "DMSans_700Bold",
                  fontSize: 15,
                  color: colors.accentForeground,
                }}
              >
                {mutation.isPending ? "Sending code…" : "Continue with email"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
