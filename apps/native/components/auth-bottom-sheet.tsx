import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation } from "@tanstack/react-query";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import { authApi } from "@/lib/auth";
import { useAuth } from "@/contexts/auth-context";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Step = "email" | "otp";

const OTP_LENGTH = 6;

// ─── Component ─────────────────────────────────────────────────────────────────

export function AuthBottomSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("email");
      setEmail("");
      setEmailError("");
      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
    }, 200);
  }

  // ── Step 1: request OTP ────────────────────────────────────────────────────

  const requestOtpMutation = useMutation({
    mutationFn: () => authApi.requestOtp(email.trim()),
    onSuccess: () => {
      setStep("otp");
    },
    onError: (err: Error) => {
      setEmailError(err.message);
    },
  });

  function handleEmailSubmit() {
    setEmailError("");
    const trimmed = email.trim();

    if (!trimmed) {
      setEmailError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    requestOtpMutation.mutate();
  }

  // ── Step 2: verify OTP ────────────────────────────────────────────────────

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => authApi.verifyOtp(email.trim(), otp),
    onSuccess: async (data) => {
      await signIn(data.accessToken, data.refreshToken);
      handleClose();
    },
    onError: (err: Error) => {
      setOtpError(err.message);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    },
  });

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setOtpError("");

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = next.join("");
    if (otp.length === OTP_LENGTH && !next.includes("")) {
      verifyOtpMutation.mutate(otp);
    }
  }

  function handleOtpKeyPress(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={handleClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            paddingHorizontal: spacing[6],
            paddingBottom: spacing[8],
            paddingTop: spacing[4],
            ...shadows.modal,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
              alignSelf: "center",
              marginBottom: spacing[5],
            }}
          />

          {step === "email" && (
            <>
              {/* Logo */}
              <Text
                style={{
                  fontFamily: "Fraunces_700Bold",
                  fontSize: 28,
                  color: colors.primary,
                  textAlign: "center",
                  marginBottom: spacing[1],
                }}
              >
                sell<Text style={{ color: colors.accent }}>space</Text>
              </Text>

              <Text
                style={{
                  fontFamily: "DMSans_700Bold",
                  fontSize: 17,
                  color: colors.text,
                  marginBottom: spacing[1],
                  marginTop: spacing[4],
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
                onChangeText={(v) => { setEmail(v); setEmailError(""); }}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                editable={!requestOtpMutation.isPending}
                style={{
                  fontFamily: "DMSans_400Regular",
                  fontSize: 14,
                  color: colors.text,
                  backgroundColor: colors.surface2,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: emailError ? colors.destructive : colors.border,
                  paddingHorizontal: spacing[3],
                  paddingVertical: spacing[3],
                  marginBottom: emailError ? spacing[1] : spacing[4],
                }}
              />

              {!!emailError && (
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 12,
                    color: colors.destructive,
                    marginBottom: spacing[3],
                  }}
                >
                  {emailError}
                </Text>
              )}

              <Pressable
                onPress={handleEmailSubmit}
                disabled={requestOtpMutation.isPending}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  borderRadius: radii.md,
                  paddingVertical: spacing[3],
                  alignItems: "center",
                  opacity: requestOtpMutation.isPending || pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: "DMSans_700Bold",
                    fontSize: 14,
                    color: colors.accentForeground,
                  }}
                >
                  {requestOtpMutation.isPending ? "Sending code…" : "Continue with email"}
                </Text>
              </Pressable>
            </>
          )}

          {step === "otp" && (
            <>
              <Text
                style={{
                  fontFamily: "DMSans_700Bold",
                  fontSize: 17,
                  color: colors.text,
                  marginBottom: spacing[1],
                }}
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
                . It expires in 10 minutes.
              </Text>

              {/* OTP inputs */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: spacing[4],
                }}
              >
                {digits.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    value={digit}
                    onChangeText={(v) => handleDigitChange(i, v)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(i, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    editable={!verifyOtpMutation.isPending}
                    style={{
                      width: 44,
                      height: 52,
                      textAlign: "center",
                      fontFamily: "DMSans_700Bold",
                      fontSize: 20,
                      color: colors.text,
                      backgroundColor: colors.surface2,
                      borderRadius: radii.md,
                      borderWidth: 1,
                      borderColor: otpError
                        ? colors.destructive
                        : digit
                        ? colors.accent
                        : colors.border,
                    }}
                  />
                ))}
              </View>

              {!!otpError && (
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 12,
                    color: colors.destructive,
                    textAlign: "center",
                    marginBottom: spacing[3],
                  }}
                >
                  {otpError}
                </Text>
              )}

              {verifyOtpMutation.isPending && (
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
              )}

              <Pressable
                onPress={() => {
                  setStep("email");
                  setDigits(Array(OTP_LENGTH).fill(""));
                  setOtpError("");
                }}
              >
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 14,
                    color: colors.textMuted,
                    textAlign: "center",
                  }}
                >
                  Wrong email?{" "}
                  <Text style={{ fontFamily: "DMSans_700Bold", color: colors.accent }}>
                    Go back
                  </Text>
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
