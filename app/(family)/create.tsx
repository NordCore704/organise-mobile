import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFamily } from "../../src/contexts/FamilyContext";

export default function CreateFamilyScreen() {
  const { createFamily, error, clearError } = useFamily();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a family name");
      return;
    }
    setSubmitting(true);
    clearError();
    try {
      const result = await createFamily({ name: name.trim() });
      const code = result?.invite?.code;

      Alert.alert(
        "Family created",
        code
          ? `You are the Admin.\n\nInvite code (share with family):\n${code}`
          : "You are the Admin.",
        [{ text: "Continue" }], // navigation is handled by root layout
      );
    } catch (e: any) {
      Alert.alert(
        "Could not create family",
        e?.message ?? "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow px-5 pb-10 pt-14"
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <Image
          source={require("../../assets/images/icon.png")}
          className="mx-auto mb-6 h-16 w-16"
          resizeMode="cover"
        />

        <View className="mt-4 rounded-3xl bg-white px-5 py-8 shadow-sm">
          <Text className="mb-2 text-center font-bold text-xl text-ink">
            Create a Family
          </Text>
          <Text className="mb-6 text-center font-sans text-base text-ink-muted">
            Give your family a name. You’ll be the first Admin.
          </Text>

          {error ? (
            <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
              <Text className="text-center text-sm text-priority-high">
                {error}
              </Text>
            </View>
          ) : null}

          <Text className="mb-1.5 font-medium text-sm text-ink">
            Family name
          </Text>
          <TextInput
            className="mb-6 rounded-full bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="e.g. The Smiths"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? "opacity-60" : ""
            }`}
            onPress={handleCreate}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-base text-white">
                Create Family
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-8 items-center"
          onPress={() => router.back()}
        >
          <Text className="font-medium text-primary">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
