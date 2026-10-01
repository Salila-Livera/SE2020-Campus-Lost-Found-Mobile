import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { COLORS } from "../styles/theme";

// Root navigator: decides which stack to show based on auth state.
// When `loading` is true, show a spinner.
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Use MainStack (which wraps MainTabs) when logged in
  return user ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;
