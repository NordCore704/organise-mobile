import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFamily } from '../../src/contexts/FamilyContext';
import { useMemories } from '../../src/contexts/MemoriesContext';
import * as memoriesService from '../../src/services/memories';

export default function AddMemoryScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const { user } = useAuth();
  const { currentFamily } = useFamily();
  const { addMemory } = useMemories();

  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!albumId) {
      Alert.alert('Error', 'No folder selected. Open a folder first.');
      return;
    }
    if (!imageUri) {
      Alert.alert('Error', 'Please choose a photo');
      return;
    }
    if (!user?.uid || !currentFamily?.id) {
      Alert.alert('Error', 'Not signed in or no family');
      return;
    }

    setSubmitting(true);
    try {
      const { imageUrl, imagePath } = await memoriesService.uploadMemoryImage(
        currentFamily.id,
        user.uid,
        imageUri
      );

      await addMemory({
        albumId,
        caption: caption.trim() || undefined,
        imageUrl,
        imagePath,
        visibility: 'family',
      });

      router.back(); // back to album detail; list refreshes via context
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

        <Text className="mb-6 font-bold text-2xl text-ink">Add photo</Text>

        <View className="rounded-3xl bg-white px-5 py-6 shadow-sm">
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.85}
            className="mb-5 items-center justify-center overflow-hidden rounded-2xl bg-gray-100"
            style={{ height: 180 }}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                <Text className="mt-2 font-medium text-sm text-ink-muted">
                  Tap to choose a photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text className="mb-1.5 font-medium text-sm text-ink">
            Caption (optional)
          </Text>
          <TextInput
            className="mb-6 rounded-2xl bg-gray-100 px-5 py-3.5 font-sans text-base text-ink"
            placeholder="A short note"
            placeholderTextColor="#9CA3AF"
            value={caption}
            onChangeText={setCaption}
            multiline
          />

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? 'opacity-60' : ''
            }`}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-base text-white">
                Save photo
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}