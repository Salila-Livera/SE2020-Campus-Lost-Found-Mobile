import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import ItemDetailScreen from "../screens/ItemDetailScreen";
import AddEditItemScreen from "../screens/AddEditItemScreen";
import ClaimFormScreen from "../screens/ClaimFormScreen";
import OwnerClaimsScreen from "../screens/OwnerClaimsScreen";
import { COLORS } from "../styles/theme";

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700", fontSize: 18 },
};

// Root stack for logged-in users.
// MainTabs sits at the base; ItemDetail and AddEditItem slide over the tab bar
// so the tab bar disappears when viewing details or editing.
const MainStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="Tabs"
      component={MainTabs}
      options={{ headerShown: false }} // tabs manage their own headers
    />
    <Stack.Screen
      name="ItemDetail"
      component={ItemDetailScreen}
      options={{ title: "Item Details" }}
    />
    <Stack.Screen name="AddEditItem" component={AddEditItemScreen} />
    <Stack.Screen 
      name="ClaimForm" 
      component={ClaimFormScreen} 
      options={{ title: "Submit Claim" }}
    />
    <Stack.Screen 
      name="OwnerClaims" 
      component={OwnerClaimsScreen} 
      options={{ title: "Manage Claims" }}
    />
  </Stack.Navigator>
);

export default MainStack;
