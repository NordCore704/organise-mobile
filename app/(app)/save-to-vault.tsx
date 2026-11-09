import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVault } from '../../src/contexts/VaultContext';
import type { VaultCategory } from '../../src/types';

/**
 * Params (all optional strings from the route):
 * - memoryId, albumId, imageUrl, caption, title
 */
export default function SaveToVaultScreen() {
  const params = useLocalSearchParams<{
    memoryId?: string;
    albumId?: string;
    imageUrl?: string;
    caption?: string;
    title?: string;
  }>();

  const { categories, categoriesLoading, refreshCategories, addItem } =
    useVault();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [title, setTitle] = useState(
    params.title || params.caption || 'Saved from Memories'
  );
  const [description, setDescription] = useState(params.caption || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshCategories();
  }, []);

  const handleSave = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Choose a category', 'Pick where this should live in the Vault.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setSubmitting(true);
    try {
      await addItem({
        categoryId: selectedCategoryId,
        type: 'memory_ref',
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: params.imageUrl || undefined,
        albumId: params.albumId || undefined,
        memoryId: params.memoryId || undefined,
      });

      Alert.alert('Saved to Vault', 'Your family can find this under Vault.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save to vault');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
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

        <Text className="mb-1 font-bold text-2xl text-ink">Save to Vault</Text>
        <Text className="mb-6 font-sans text-sm text-ink-muted">
          File this memory under a vault category for the family.
        </Text>

        {/* Preview */}
        {params.imageUrl ? (
          <Image
            source={{ uri: params.imageUrl }}
            className="mb-5 h-40 w-full rounded-2xl"
            resizeMode="cover"
          />
        ) : null}

        <View className="mb-5 rounded-3xl bg-white px-5 py-5 shadow-sm">
          <Text className="mb-1.5 font-medium text-sm text-ink">Title</Text>
          <TextInput
            className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="Title in the vault"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <Text className="mb-1.5 font-medium text-sm text-ink">
            Note (optional)
          </Text>
          <TextInput
            className="rounded-2xl bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="Why this matters for the family"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <Text className="mb-2 font-semibold text-sm text-ink-muted">
          CHOOSE CATEGORY
        </Text>

        {categoriesLoading ? (
          <ActivityIndicator color="#7C3AED" className="my-6" />
        ) : categories.length === 0 ? (
          <View className="mb-4 rounded-2xl bg-white p-5">
            <Text className="mb-3 font-sans text-sm text-ink-muted">
              No vault categories yet. Create one first.
            </Text>
            <TouchableOpacity
              className="items-center rounded-full bg-primary py-3"
              onPress={() => router.push('/(app)/add-vault-category')}
            >
              <Text className="font-semibold text-sm text-white">
                Create category
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          categories.map((cat: VaultCategory) => {
            const selected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                className={`mb-2 flex-row items-center rounded-2xl px-4 py-3.5 ${
                  selected ? 'bg-primary-light' : 'bg-white'
                }`}
                onPress={() => setSelectedCategoryId(cat.id)}
                activeOpacity={0.85}
              >
                <View
                  className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                    selected ? 'bg-primary' : 'bg-primary-light'
                  }`}
                >
                  <Ionicons
                    name="folder-outline"
                    size={20}
                    color={selected ? '#fff' : '#7C3AED'}
                  />
                </View>
                <Text
                  className={`flex-1 font-semibold text-base ${
                    selected ? 'text-primary' : 'text-ink'
                  }`}
                >
                  {cat.title}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color="#7C3AED" />
                ) : null}
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity
          className={`mt-6 items-center rounded-full bg-primary py-4 ${
            submitting ? 'opacity-60' : ''
          }`}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-base text-white">
              Save to Vault
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}