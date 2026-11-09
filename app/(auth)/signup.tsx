import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function SignUpScreen() {
  const { signUp, error, clearError } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!displayName.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (!agreed) {
      Alert.alert('Terms', 'Please agree to the Terms of Service to continue');
      return;
    }
    setSubmitting(true);
    clearError();
    try {
      await signUp(email.trim(), password, displayName.trim());
    } catch {
      // context error
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
        contentContainerClassName="flex-grow justify-center px-5 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-lg text-ink">←</Text>
          </TouchableOpacity>
                      <Image
        source={require('../../assets/images/icon.png')}
        className="mx-auto mb-6 h-16 w-16"
        resizeMode="cover"
      />
        </View>

        <View className="rounded-3xl bg-white px-5 py-8 shadow-sm">
          <Text className="mb-6 text-center text-2xl font-bold text-ink">
            Create an Account?
          </Text>

          {error ? (
            <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
              <Text className="text-center text-sm text-priority-high font-medium">{error}</Text>
            </View>
          ) : null}

          <Text className="mb-1.5 text-sm font-medium text-ink">Name</Text>
          <TextInput
            className="mb-4 rounded-full border-0 bg-gray-100 font-medium px-5 py-3.5 text-base text-ink"
            placeholder="Your full name"
            placeholderTextColor="#9CA3AF"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />

          <Text className="mb-1.5 text-sm font-medium text-ink">Email</Text>
          <TextInput
            className="mb-4 rounded-full border-0 font-medium bg-gray-100 px-5 py-3.5 text-base text-ink"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text className="mb-1.5 text-sm font-medium text-ink">Password</Text>
          <View className="mb-4 flex-row items-center rounded-full bg-gray-100 px-5">
            <TextInput
              className="flex-1 font-medium py-3.5 text-base text-ink"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Text className="text-sm text-ink-muted font-medium">
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            className="mb-6 flex-row items-center"
            onPress={() => setAgreed((v) => !v)}
          >
            <View
              className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                agreed ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
              }`}
            >
              {agreed ? <Text className="text-xs text-white font-medium">✓</Text> : null}
            </View>
            <Text className="flex-1 font-medium text-sm text-ink-muted">
              I agree to the <Text className="font-medium text-primary">Terms of Service</Text>
            </Text>
          </Pressable>

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? 'opacity-60' : ''
            }`}
            onPress={handleSignUp}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">Create account</Text>
            )}
          </TouchableOpacity>

          <Text className="mb-4 mt-6 text-center text-sm font-medium text-ink-muted">
            Or sign in with
          </Text>
          <View className="flex-row justify-center gap-3">
            {['f', 'G', ''].map((label, i) => (
              <View
                key={i}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-gray-100"
              >
                <Text className="text-base font-bold text-ink-muted">{label || ' '}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}