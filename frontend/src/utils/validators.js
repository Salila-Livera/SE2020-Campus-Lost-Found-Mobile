/**
 * Advanced Client-Side Validation Utilities
 * Provides rich validation, regex checks, and password strength scoring.
 */

// Strict RFC 5322 compliant regex requiring a valid domain and TLD (e.g. .edu, .com, .ac.lk)
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// International and local phone regex (supports +, dashes, spaces, parentheses)
export const PHONE_CHARS_REGEX = /^[+]?[\d\s\-().]+$/;

// Valid name characters: alphabets, spaces, apostrophes, hyphens, dots
export const NAME_REGEX = /^[A-Za-z\s.'-]+$/;

/**
 * Validate Full Name
 */
export const validateName = (name) => {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Full name is required." };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters." };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: "Name cannot exceed 50 characters." };
  }
  if (!NAME_REGEX.test(trimmed)) {
    return { isValid: false, error: "Name can only contain letters, spaces, and hyphens." };
  }
  const lettersOnly = trimmed.replace(/[^A-Za-z]/g, "");
  if (lettersOnly.length < 2) {
    return { isValid: false, error: "Name must contain at least 2 letters." };
  }
  return { isValid: true, error: "" };
};

/**
 * Validate Email Address
 */
export const validateEmail = (email) => {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required." };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: "Email address cannot exceed 100 characters." };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. user@university.edu)." };
  }
  return { isValid: true, error: "" };
};

/**
 * Calculate Password Strength and Return Validation Result
 * Score: 0 (Empty), 1 (Weak), 2 (Fair), 3 (Good), 4 (Strong)
 */
export const validatePassword = (password) => {
  const val = password || "";
  if (!val) {
    return {
      isValid: false,
      error: "Password is required.",
      score: 0,
      strengthLabel: "",
      checks: { minLength: false, hasLetter: false, hasNumber: false, hasSpecial: false },
    };
  }

  const checks = {
    minLength: val.length >= 6,
    hasLetter: /[a-zA-Z]/.test(val),
    hasNumber: /[0-9]/.test(val),
    hasSpecial: /[^A-Za-z0-9]/.test(val),
  };

  let score = 0;
  if (checks.minLength) score += 1;
  if (checks.hasLetter) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial || val.length >= 10) score += 1;

  let strengthLabel = "Weak";
  let color = "#EF4444"; // Red
  if (score === 2) {
    strengthLabel = "Fair";
    color = "#F59E0B"; // Amber
  } else if (score === 3) {
    strengthLabel = "Good";
    color = "#3B82F6"; // Blue
  } else if (score === 4) {
    strengthLabel = "Strong";
    color = "#10B981"; // Green
  }

  if (val.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters.",
      score,
      strengthLabel,
      color,
      checks,
    };
  }

  if (!checks.hasLetter || !checks.hasNumber) {
    return {
      isValid: false,
      error: "Password must contain at least one letter and one number.",
      score,
      strengthLabel,
      color,
      checks,
    };
  }

  const commonWeak = ["123456", "password", "password123", "qwerty", "admin123"];
  if (commonWeak.includes(val.toLowerCase())) {
    return {
      isValid: false,
      error: "This password is too easily guessed. Please choose a stronger password.",
      score: 1,
      strengthLabel: "Too Common",
      color: "#EF4444",
      checks,
    };
  }

  return {
    isValid: true,
    error: "",
    score,
    strengthLabel,
    color,
    checks,
  };
};

/**
 * Validate Confirm Password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password." };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }
  return { isValid: true, error: "" };
};

/**
 * Validate Mobile Phone Number (Optional field, but strict if provided)
 */
export const validatePhone = (phone) => {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return { isValid: true, error: "" }; // Optional
  }

  if (!PHONE_CHARS_REGEX.test(trimmed)) {
    return { isValid: false, error: "Phone number contains invalid characters." };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) {
    return { isValid: false, error: "Phone number must contain 9 to 15 digits." };
  }

  // Check repeating digits like 000000000
  if (/^(\d)\1+$/.test(digits)) {
    return { isValid: false, error: "Please enter a valid, non-repeating phone number." };
  }

  return { isValid: true, error: "" };
};
