import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="add-task"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen name="add-album" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-memory" options={{ presentation: "modal" }} />
      <Stack.Screen name="album/[id]" />
      <Stack.Screen
        name="album/viewer"
        options={{ presentation: "fullScreenModal", headerShown: false }}
      />
      <Stack.Screen name="vault/category/[id]" />
      <Stack.Screen
        name="add-vault-category"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="add-vault-item" options={{ presentation: "modal" }} />
      <Stack.Screen name="save-to-vault" options={{ presentation: "modal" }} />
      <Stack.Screen name="vault-pin" />
      <Stack.Screen name="manage-family" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
