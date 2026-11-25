import { PLANS, formatBytes, getPlan } from "@/src/config/plans";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFamily } from "../../src/contexts/FamilyContext";
import * as vaultService from "../../src/services/vault";
import type { VaultUsage } from "../../src/types";

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { currentFamily } = useFamily();
  const plan = getPlan(currentFamily?.planId);
  const [usage, setUsage] = useState<VaultUsage | null>(null);

  useEffect(() => {
    if (!currentFamily?.id) return;
    vaultService
      .getVaultUsageForFamily(currentFamily.id)
      .then(setUsage)
      .catch(() => setUsage({ fileCount: 0, totalBytes: 0 }));
  }, [currentFamily?.id]);

  const handleSelectPro = () => {
    // Placeholder — no real payment yet
    Alert.alert(
      "Pro (coming soon)",
      'This is a placeholder. Later this will start checkout. For testing, an admin can set planId to "pro" on the family document in Firestore.',
      [{ text: "OK" }],
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 12) + 40,
          paddingBottom: 40 + insets.bottom,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <Text className="mb-1 font-bold text-2xl text-ink">Vault plans</Text>
        <Text className="mb-6 font-sans text-sm text-ink-muted">
          Limits apply to files stored in your family vault.
        </Text>

        {/* Current usage */}
        <View className="mb-6 rounded-3xl bg-white px-5 py-4">
          <Text className="mb-2 font-semibold text-sm text-ink-muted">
            CURRENT USAGE · {plan.name.toUpperCase()}
          </Text>
          <Text className="font-semibold text-base text-ink">
            {usage ? usage.fileCount : "—"} / {plan.maxVaultFiles} files
          </Text>
          <Text className="mt-1 font-sans text-sm text-ink-muted">
            {usage ? formatBytes(usage.totalBytes) : "—"} /{" "}
            {formatBytes(plan.maxVaultBytes)}
          </Text>
        </View>

        {/* Free card */}
        <View className="mb-4 rounded-3xl border border-primary/30 bg-white px-5 py-5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-bold text-lg text-ink">Free</Text>
            {plan.id === "free" ? (
              <View className="rounded-full bg-primary-light px-3 py-1">
                <Text className="font-semibold text-xs text-primary">
                  Current
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="font-sans text-sm text-ink-muted">
            {PLANS.free.maxVaultFiles} vault files ·{" "}
            {formatBytes(PLANS.free.maxVaultBytes)} storage
          </Text>
        </View>

        {/* Pro card */}
        <View className="mb-4 rounded-3xl bg-primary px-5 py-5">
          <Text className="mb-1 font-bold text-lg text-white">Pro</Text>
          <Text className="mb-4 font-sans text-sm text-white/80">
            {PLANS.pro.maxVaultFiles} vault files ·{" "}
            {formatBytes(PLANS.pro.maxVaultBytes)} storage
          </Text>
          <TouchableOpacity
            className="items-center rounded-full bg-white py-3.5"
            onPress={handleSelectPro}
            activeOpacity={0.85}
          >
            <Text className="font-semibold text-sm text-primary">
              Upgrade (placeholder)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
