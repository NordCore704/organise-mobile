import { useVault } from "@/src/contexts/VaultContext";
import { useVaultLock } from "@/src/contexts/VaultLockContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router, useSegments } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useFamily } from "../../../src/contexts/FamilyContext";
import { useEffect } from "react";

function CenterAddButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/(app)/add-task")}
      activeOpacity={0.85}
      className="-mt-5 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-md"
    >
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { currentFamily } = useFamily();
const { lock, pinEnabled } = useVaultLock();
  const segments = useSegments();

  // Example segments: ['(app)', '(tabs)', 'vault'] or ['(app)', '(tabs)', 'index']
  const onVaultTab = (segments as string[]).includes("vault");

  useEffect(() => {
    // Lock when user leaves the Vault tab (not while rendering)
    if (pinEnabled && !onVaultTab) {
      lock();
    }
  }, [onVaultTab, pinEnabled, lock]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: currentFamily?.name || "Family App",
        headerTitleStyle: {
          fontFamily: "PlusJakartaSans_600SemiBold",
          fontSize: 17,
        },
        headerStyle: { backgroundColor: "#F8F7FC" },
        headerShadowVisible: false,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F3F4F6",
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-placeholder"
        options={{
          title: "",
          tabBarButton: () => <CenterAddButton />,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: "Memories",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="lock-closed-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
