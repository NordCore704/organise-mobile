import { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVault } from '../../src/contexts/VaultContext';

export default function AddVaultCategoryScreen() {
  const { createCategory } = useVault();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    setSubmitting(true);
    try {
      const cat = await createCategory({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      router.replace(`/(app)/vault/category/${cat.id}`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not create');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

        <Text className="mb-2 font-bold text-2xl text-ink">New category</Text>
        <Text className="mb-6 font-sans text-sm text-ink-muted">
          e.g. Property, Documents, Health, Digital accounts
        </Text>

        <View className="rounded-3xl bg-white px-5 py-6 shadow-sm">
          <Text className="mb-1.5 font-medium text-sm text-ink">Name</Text>
          <TextInput
            className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="Category name"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <Text className="mb-1.5 font-medium text-sm text-ink">
            Description (optional)
          </Text>
          <TextInput
            className="mb-6 rounded-2xl bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="What belongs here?"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? 'opacity-60' : ''
            }`}
            onPress={handleCreate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-base text-white">
                Create category
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}