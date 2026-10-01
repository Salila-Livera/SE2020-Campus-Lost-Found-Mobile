import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import BrowseItemsScreen from "../screens/BrowseItemsScreen";
import MyItemsScreen from "../screens/MyItemsScreen";
import AddEditItemScreen from "../screens/AddEditItemScreen";
import MyClaimsScreen from "../screens/MyClaimsScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { COLORS, SHADOWS } from "../styles/theme";

const Tab = createBottomTabNavigator();

// Helper so we don't repeat the icon boilerplate for every tab
const tabIcon = (name) =>
  ({ color, size }) =>
    <Ionicons name={name} size={size} color={color} />;

// Main tab bar — shown once the user is logged in.
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.borderLight,
        paddingBottom: 4,
        height: 62,
        ...SHADOWS.card,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "700", fontSize: 18 },
    }}
  >
    <Tab.Screen
      name="Items"
      component={BrowseItemsScreen}
      options={{
        title: "Browse Items",
        tabBarIcon: tabIcon("search-outline"),
      }}
    />
    <Tab.Screen
      name="AddItem"
      component={AddEditItemScreen}
      listeners={({ navigation }) => ({
        // Intercept tab press to push the full-screen AddEditItem
        // instead of treating it as a standard bottom tab.
        tabPress: (e) => {
          e.preventDefault();
          navigation.navigate("AddEditItem");
        },
      })}
      options={{
        title: "Report Item",
        tabBarIcon: tabIcon("add-circle-outline"),
      }}
    />
    <Tab.Screen
      name="MyItems"
      component={MyItemsScreen}
      options={{
        title: "My Items",
        tabBarIcon: tabIcon("list-outline"),
      }}
    />
    <Tab.Screen
      name="MyClaims"
      component={MyClaimsScreen}
      options={{
        title: "My Claims",
        tabBarIcon: tabIcon("document-text-outline"),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: "Profile",
        tabBarIcon: tabIcon("person-outline"),
      }}
    />
  </Tab.Navigator>
);

export default MainTabs;
