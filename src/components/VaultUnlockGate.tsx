import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVaultLock } from "../contexts/VaultLockContext";

type Props = {
  children: React.ReactNode;
};

/**
 * Wraps Vault tab content. If PIN is on and session locked → unlock screen.
 */
export function VaultUnlockGate({ children }: Props) {
  const { pinEnabled, unlocked, loading, unlock } = useVaultLock();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

    const handleUnlock = async () => {
    setError("");
    setBusy(true);
    try {
      const ok = await unlock(pin);
      if (!ok) {
        setError("Incorrect PIN");
        setPin("");
      }
    } finally {
      setBusy(false);
    }
  };


  if (pinEnabled && !unlocked) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#EEEAF8]">
          <Ionicons name="lock-closed" size={36} color="#7C3AED" />
        </View>
        <Text className="mb-2 font-bold text-2xl text-ink">Vault locked</Text>
        <Text className="mb-8 text-center font-sans text-sm text-ink-muted">
          Enter your PIN to view important family information.
        </Text>

        <TextInput
          className="mb-3 w-full rounded-full bg-white px-5 py-3.5 text-center font-semibold text-2xl tracking-[8px] text-ink"
          placeholder="••••"
          placeholderTextColor="#D1D5DB"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={8}
          editable={!busy}
        />

        {error ? (
          <Text className="mb-3 font-medium text-sm text-priority-high">
            {error}
          </Text>
        ) : (
          <View className="mb-3 h-5" />
        )}

        <TouchableOpacity
          className={`w-full items-center rounded-full bg-primary py-4 ${
            busy ? "opacity-60" : ""
          }`}
          onPress={handleUnlock}
          disabled={busy || pin.length < 4}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-base text-white">Unlock</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }


  return <>{children}</>;
}
