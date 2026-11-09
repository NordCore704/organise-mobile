import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const { resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setSubmitting(true);
    clearError();
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      // error from context
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <View className="flex-1 justify-center bg-surface px-6">
        <View className="items-center rounded-2xl bg-surface-card p-6">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary-light">
            <Text className="text-2xl">✉️</Text>
          </View>
          <Text className="mb-2 text-center text-2xl font-bold text-ink">
            Check your email
          </Text>
          <Text className="mb-6 text-center text-base text-ink-muted">
            We sent a reset link to{'\n'}
            <Text className="font-medium text-ink">{email}</Text>
          </Text>
          <TouchableOpacity
            className="w-full items-center rounded-xl bg-primary py-4"
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text className="text-base font-semibold text-white">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="flex-grow justify-center px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-10 items-center">
        <Text className="text-3xl font-bold text-ink">Reset password</Text>
        <Text className="mt-2 text-center text-base text-ink-muted">
          Enter your email and we’ll send a reset link
        </Text>
      </View>

      <View className="rounded-2xl bg-surface-card p-5 shadow-sm">
        {error ? (
          <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
            <Text className="text-center text-sm text-priority-high">{error}</Text>
          </View>
        ) : null}

        <Text className="mb-1.5 text-sm font-medium text-ink">Email</Text>
        <TextInput
          className="mb-6 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-ink"
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        <TouchableOpacity
          className={`mb-3 items-center rounded-xl bg-primary py-4 ${
            submitting ? 'opacity-60' : ''
          }`}
          onPress={handleReset}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-center font-medium text-primary">Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}