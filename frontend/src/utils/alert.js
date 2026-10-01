import { Alert, Platform } from "react-native";

/**
 * Cross-platform confirmation dialog that works reliably on iOS, Android, and Web.
 * On Web: uses window.confirm.
 * On Native: uses Alert.alert with buttons.
 */
export const confirmDialog = (title, message, onConfirm, confirmText = "Confirm", isDestructive = true) => {
  if (Platform.OS === "web") {
    const text = title ? `${title}\n\n${message}` : message;
    if (typeof window !== "undefined" && window.confirm(text)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: confirmText,
        style: isDestructive ? "destructive" : "default",
        onPress: onConfirm,
      },
    ]);
  }
};

/**
 * Cross-platform alert that displays a message and optionally executes a callback on dismissal.
 */
export const notifyDialog = (title, message, onClose) => {
  if (Platform.OS === "web") {
    const text = title ? `${title}\n\n${message}` : message;
    if (typeof window !== "undefined") {
      window.alert(text);
    }
    if (onClose) onClose();
  } else {
    Alert.alert(title, message, [{ text: "OK", onPress: onClose }]);
  }
};
