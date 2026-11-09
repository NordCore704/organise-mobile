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
import { useMemories } from '../../src/contexts/MemoriesContext';

export default function AddAlbumScreen() {
  const { createAlbum } = useMemories();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    setSubmitting(true);
    try {
      const album = await createAlbum({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      // Open the new folder so they can add photos
      router.replace(`/(app)/album/${album.id}`);
    } catch (e: any) {
      Alert.alert('Could not create folder', e?.message ?? 'Try again');
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

        <Text className="mb-6 font-bold text-2xl text-ink">New folder</Text>

        <View className="rounded-3xl bg-white px-5 py-6 shadow-sm">
          <Text className="mb-1.5 font-medium text-sm text-ink">Name</Text>
          <TextInput
            className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="e.g. Christmas 2026"
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
            placeholder="What is this folder about?"
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
                Create folder
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}