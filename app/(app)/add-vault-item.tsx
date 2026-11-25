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
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFamily } from '../../src/contexts/FamilyContext';
import { useVault } from '../../src/contexts/VaultContext';
import * as vaultService from '../../src/services/vault';
import type { VaultItemType } from '../../src/types';
import * as vaultLimits from '../../src/services/vaultLimit';

const TYPES: { key: VaultItemType; label: string }[] = [
  { key: 'note', label: 'Note' },
  { key: 'possession', label: 'Possession' },
  { key: 'document', label: 'Document' },
];

export default function AddVaultItemScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { user } = useAuth();
  const { currentFamily } = useFamily();
  const { addItem } = useVault();

  const [type, setType] = useState<VaultItemType>('note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [picked, setPicked] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    size?: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setPicked({
        uri: asset.uri,
        name: asset.name || 'document',
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size,
      });

      // Prefill title from filename if empty
      if (!title.trim() && asset.name) {
        setTitle(asset.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not open file picker');
    }
  };

  const handleSave = async () => {
    if (!categoryId) {
      Alert.alert('Error', 'No category selected');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (type === 'document' && !picked) {
      Alert.alert('Error', 'Please attach a document');
      return;
    }
    if (!user?.uid || !currentFamily?.id) {
      Alert.alert('Error', 'Not signed in or no family');
      return;
    }

    const check = await vaultLimits.canAddVaultFile(
  currentFamily.id,
  currentFamily.planId,
  picked?.size ?? 0
);

if (!check.ok) {
  Alert.alert('Limit reached', check.reason, [
    { text: 'Not now', style: 'cancel' },
    {
      text: 'View plans',
      onPress: () => router.push('/(app)/plans'),
    },
  ]);
  setSubmitting(false);
  return;
}

    setSubmitting(true);
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let imageUrl: string | undefined;

      if (picked) {
        const uploaded = await vaultService.uploadVaultFile(
          currentFamily.id,
          user.uid,
          picked.uri,
          picked.name,
          picked.mimeType
        );
        fileUrl = uploaded.fileUrl;
        fileName = uploaded.fileName;
        // If it's an image, also set imageUrl for thumbnails in the list
        if (picked.mimeType.startsWith('image/')) {
          imageUrl = uploaded.fileUrl;
        }
      }

      await addItem({
        categoryId,
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        fileUrl,
        fileName,
        imageUrl,
      });

      router.back();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Try again');
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

        <Text className="mb-6 font-bold text-2xl text-ink">Add vault item</Text>

        <View className="rounded-3xl bg-white px-5 py-6 shadow-sm">
          <Text className="mb-2 font-medium text-sm text-ink">Type</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => {
                  setType(t.key);
                  if (t.key === 'note') setPicked(null);
                }}
                className={`rounded-full px-4 py-2 ${
                  type === t.key ? 'bg-primary' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    type === t.key ? 'text-white' : 'text-ink-muted'
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
            placeholder="e.g. Passport scan"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <Text className="mb-1.5 font-medium text-sm text-ink">
            Details (optional)
          </Text>
          <TextInput
            className="mb-4 rounded-2xl bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="Anything the family should know"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* File attach — document required; possession optional */}
          {(type === 'document' || type === 'possession') && (
            <View className="mb-6">
              <Text className="mb-2 font-medium text-sm text-ink">
                {type === 'document' ? 'Attachment' : 'Photo / file (optional)'}
              </Text>
              {picked ? (
                <View className="flex-row items-center rounded-2xl bg-surface px-4 py-3">
                  <Ionicons name="document-attach-outline" size={22} color="#7C3AED" />
                  <Text
                    className="ml-3 flex-1 font-medium text-sm text-ink"
                    numberOfLines={1}
                  >
                    {picked.name}
                  </Text>
                  <TouchableOpacity onPress={() => setPicked(null)}>
                    <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary-light py-4"
                  onPress={pickDocument}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cloud-upload-outline" size={22} color="#7C3AED" />
                  <Text className="ml-2 font-semibold text-sm text-primary">
                    Choose file
                  </Text>
                </TouchableOpacity>
              )}
              <Text className="mt-2 font-sans text-xs text-ink-muted">
                PDF or image · uploaded to family vault storage
              </Text>
            </View>
          )}

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? 'opacity-60' : ''
            }`}
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.85}
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
  );
}