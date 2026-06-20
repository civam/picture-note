import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="image-multiple-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="album"
        options={{
          title: "Albums",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-multiple-image" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E5E5EA",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
});
