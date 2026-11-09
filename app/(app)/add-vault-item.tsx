import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useVault } from "../../src/contexts/VaultContext";
import type { VaultItemType } from "../../src/types";
import { VaultUnlockGate } from "@/src/components/VaultUnlockGate";

const TYPES: { key: VaultItemType; label: string }[] = [
  { key: "note", label: "Note" },
  { key: "possession", label: "Possession" },
  { key: "document", label: "Document" },
];

export default function AddVaultItemScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { addItem } = useVault();

  const [type, setType] = useState<VaultItemType>("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!categoryId) {
      Alert.alert("Error", "No category selected");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    setSubmitting(true);
    try {
      await addItem({
        categoryId,
        type,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VaultUnlockGate>
      <KeyboardAvoidingView
        className="flex-1 bg-surface"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 56,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="close" size={22} color="#111827" />
          </TouchableOpacity>

          <Text className="mb-6 font-bold text-2xl text-ink">
            Add vault item
          </Text>

          <View className="rounded-3xl bg-white px-5 py-6 shadow-sm">
            <Text className="mb-2 font-medium text-sm text-ink">Type</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setType(t.key)}
                  className={`rounded-full px-4 py-2 ${
                    type === t.key ? "bg-primary" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      type === t.key ? "text-white" : "text-ink-muted"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="mb-1.5 font-medium text-sm text-ink">Title</Text>
            <TextInput
              className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
              placeholder="e.g. House keys location"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text className="mb-1.5 font-medium text-sm text-ink">
              Details (optional)
            </Text>
            <TextInput
              className="mb-6 rounded-2xl bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
              placeholder="Anything the family should know"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              className={`items-center rounded-full bg-primary py-4 ${
                submitting ? "opacity-60" : ""
              }`}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-semibold text-base text-white">
                  Save to vault
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </VaultUnlockGate>
  );
}
