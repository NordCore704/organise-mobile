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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '../../src/contexts/FamilyContext';

export default function JoinFamilyScreen() {
  const { joinFamily, error, clearError } = useFamily();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    setSubmitting(true);
    clearError();
    try {
      await joinFamily({ code: code.trim() });
      Alert.alert('Success', 'You have joined the family!');
    } catch (e: any) {
      Alert.alert('Could not join', e?.message ?? 'Invalid or expired code');
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
        contentContainerClassName="flex-grow px-5 pb-10 pt-14"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

       
             <Image
        source={require('../../assets/images/icon.png')}
        className="mx-auto mb-6 h-16 w-16"
        resizeMode="cover"
      />
        <View className="mt-4 rounded-3xl bg-white px-5 py-8 shadow-sm">
          <Text className="mb-2 text-center font-bold text-xl text-ink">
            Join a Family
          </Text>
          <Text className="mb-6 text-center font-sans text-base text-ink-muted">
            Enter the invite code shared by a family Admin.
          </Text>

          {error ? (
            <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
              <Text className="text-center text-sm text-priority-high">{error}</Text>
            </View>
          ) : null}

          <Text className="mb-1.5 font-medium text-sm text-ink">Invite code</Text>
          <TextInput
            className="mb-6 rounded-full bg-gray-100 px-5 py-3.5 text-center font-semibold text-lg tracking-widest text-ink"
            placeholder="FAM-7K2P"
            placeholderTextColor="#9CA3AF"
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? 'opacity-60' : ''
            }`}
            onPress={handleJoin}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-base text-white">Join Family</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-8 items-center" onPress={() => router.back()}>
          <Text className="font-medium text-primary">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}