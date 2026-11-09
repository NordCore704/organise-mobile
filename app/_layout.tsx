import "react-native-gesture-handler";
import "../global.css";

import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { FamilyProvider, useFamily } from "../src/contexts/FamilyContext";
import { TasksProvider } from "../src/contexts/TasksContext";
import { MemoriesProvider } from "../src/contexts/MemoriesContext";
import { VaultProvider } from "@/src/contexts/VaultContext";
import { VaultLockProvider } from "@/src/contexts/VaultLockContext";

function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { families, loading: familyLoading } = useFamily();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user && familyLoading) return;

    const inAuth = segments[0] === "(auth)";
    const inFamilySetup = segments[0] === "(family)";
    const inWelcome = segments[1] === "welcome";

    // Logged out → always land in auth group (prefer welcome if outside auth)
    if (!user) {
      if (!inAuth) {
        router.replace("/(auth)/welcome");
      }
      return;
    }

    // Logged in + has at least one family → main app Home
    if (user && families.length > 0 && (inAuth || inFamilySetup)) {
      router.replace("/(app)/(tabs)");
      // or: router.replace('/(app)/(tabs)/index');
    }

    // Logged in, no family → family setup
    if (families.length === 0 && !inFamilySetup) {
      router.replace("/(family)");
      return;
    }

    // // Logged in, has family → main app (leave auth/family setup)
    // if (families.length > 0 && (inAuth || inFamilySetup)) {
    //   router.replace('/(app)/(tabs)/todos');
    // }
  }, [user, families, authLoading, familyLoading, segments]);

  if (authLoading || (user && familyLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // if (!user) {
  //   router.replace('/(auth)/welcome');
  //   return;
  // }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(family)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <FamilyProvider>
        <TasksProvider>
          <MemoriesProvider>
            <VaultLockProvider>
              <VaultProvider>
                <RootNavigator />
              </VaultProvider>
            </VaultLockProvider>
          </MemoriesProvider>
        </TasksProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}
