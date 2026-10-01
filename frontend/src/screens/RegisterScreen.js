import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS, SHADOWS } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
} from "../utils/validators";
import AppLogo from "../components/AppLogo";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  // Refs for smooth keyboard traversal
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);

  // Real-time password evaluation
  const pwdValidation = validatePassword(password);
  const isMatch = Boolean(password && confirmPassword && password === confirmPassword);

  // Clear specific field error as user types
  const handleFieldChange = (setter, field) => (val) => {
    setter(val);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (generalError) setGeneralError("");
  };

  // Comprehensive client validation before network call
  const validateForm = () => {
    const errors = {};

    const nameRes = validateName(name);
    if (!nameRes.isValid) errors.name = nameRes.error;

    const emailRes = validateEmail(email);
    if (!emailRes.isValid) errors.email = emailRes.error;

    const pwdRes = validatePassword(password);
    if (!pwdRes.isValid) errors.password = pwdRes.error;

    const confirmRes = validateConfirmPassword(password, confirmPassword);
    if (!confirmRes.isValid) errors.confirmPassword = confirmRes.error;

    const phoneRes = validatePhone(phone);
    if (!phoneRes.isValid) errors.phone = phoneRes.error;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim());
      // AuthContext updates user state → AppNavigator navigates automatically
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.fields) {
        // Structured field map from backend
        setFieldErrors(respData.fields);
      } else if (respData?.errors && Array.isArray(respData.errors)) {
        // Fallback for array format
        const map = {};
        respData.errors.forEach((e) => {
          if (e.path) map[e.path] = e.msg;
        });
        setFieldErrors(map);
      } else {
        setGeneralError(
          respData?.message || err.message || "Registration failed. Please check your connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <AppLogo size={76} />
          <Text style={styles.appName}>CampusFind</Text>
          <Text style={styles.tagline}>Join your campus community</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>
            Sign up to report, track, or claim campus items
          </Text>

          {/* General error banner */}
          {generalError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, fieldErrors.name && styles.inputError]}
            placeholder="e.g. Alice Johnson"
            placeholderTextColor={COLORS.placeholder}
            value={name}
            onChangeText={handleFieldChange(setName, "name")}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}

          {/* Email */}
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            ref={emailRef}
            style={[styles.input, fieldErrors.email && styles.inputError]}
            placeholder="you@university.edu"
            placeholderTextColor={COLORS.placeholder}
            value={email}
            onChangeText={handleFieldChange(setEmail, "email")}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <View style={[styles.passwordWrapper, fieldErrors.password && styles.inputError]}>
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={handleFieldChange(setPassword, "password")}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.password && <Text style={styles.fieldError}>{fieldErrors.password}</Text>}

          {/* 4-Bar Password Strength Meter */}
          {password.length > 0 && (
            <View style={styles.meterContainer}>
              <View style={styles.meterHeader}>
                <Text style={styles.meterTitle}>Strength:</Text>
                <Text style={[styles.meterLabel, { color: pwdValidation.color }]}>
                  {pwdValidation.strengthLabel}
                </Text>
              </View>
              <View style={styles.meterBars}>
                {[1, 2, 3, 4].map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.meterBar,
                      pwdValidation.score >= step && { backgroundColor: pwdValidation.color },
                    ]}
                  />
                ))}
              </View>

              {/* Requirement Checkpoints */}
              <View style={styles.checkpoints}>
                <View style={styles.checkItem}>
                  <Ionicons
                    name={pwdValidation.checks.minLength ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                    color={pwdValidation.checks.minLength ? COLORS.success : COLORS.placeholder}
                  />
                  <Text style={[styles.checkText, pwdValidation.checks.minLength && styles.checkTextActive]}>
                    6+ characters
                  </Text>
                </View>
                <View style={styles.checkItem}>
                  <Ionicons
                    name={pwdValidation.checks.hasLetter ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                    color={pwdValidation.checks.hasLetter ? COLORS.success : COLORS.placeholder}
                  />
                  <Text style={[styles.checkText, pwdValidation.checks.hasLetter && styles.checkTextActive]}>
                    Letters
                  </Text>
                </View>
                <View style={styles.checkItem}>
                  <Ionicons
                    name={pwdValidation.checks.hasNumber ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                    color={pwdValidation.checks.hasNumber ? COLORS.success : COLORS.placeholder}
                  />
                  <Text style={[styles.checkText, pwdValidation.checks.hasNumber && styles.checkTextActive]}>
                    Numbers
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password *</Text>
          <View style={[styles.passwordWrapper, fieldErrors.confirmPassword && styles.inputError]}>
            <TextInput
              ref={confirmPasswordRef}
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={COLORS.placeholder}
              value={confirmPassword}
              onChangeText={handleFieldChange(setConfirmPassword, "confirmPassword")}
              secureTextEntry={!showConfirmPassword}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            {confirmPassword.length > 0 && (
              <Ionicons
                name={isMatch ? "checkmark-circle" : "close-circle"}
                size={20}
                color={isMatch ? COLORS.success : COLORS.error}
                style={{ marginRight: 6 }}
              />
            )}
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.confirmPassword && (
            <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
          )}

          {/* Phone (optional) */}
          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextInput
            ref={phoneRef}
            style={[styles.input, fieldErrors.phone && styles.inputError]}
            placeholder="+94 77 123 4567 or 0771234567"
            placeholderTextColor={COLORS.placeholder}
            value={phone}
            onChangeText={handleFieldChange(setPhone, "phone")}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          {fieldErrors.phone ? (
            <Text style={styles.fieldError}>{fieldErrors.phone}</Text>
          ) : (
            <Text style={styles.fieldHint}>Used only when someone claims an item you found.</Text>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>Creating Account...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer link ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 24 },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  tagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.errorLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontSize: 13, flex: 1 },
  fieldError: { color: COLORS.error, fontSize: 12, marginTop: -10, marginBottom: 12, marginLeft: 2 },
  fieldHint: { color: COLORS.placeholder, fontSize: 11, marginTop: -10, marginBottom: 14, marginLeft: 2 },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  inputError: { borderColor: COLORS.error },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // 4-Segment Password Strength Meter
  meterContainer: {
    marginTop: -4,
    marginBottom: 16,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  meterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  meterTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  meterLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  meterBars: {
    flexDirection: "row",
    height: 4,
    gap: 4,
    marginBottom: 8,
  },
  meterBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  checkpoints: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checkText: {
    fontSize: 11,
    color: COLORS.placeholder,
  },
  checkTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "500",
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    ...SHADOWS.primaryButton,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loadingRow: { flexDirection: "row", alignItems: "center" },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
});

export default RegisterScreen;
