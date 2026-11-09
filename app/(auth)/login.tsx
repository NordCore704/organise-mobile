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
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setSubmitting(true);
    clearError();
    try {
      await signIn(email.trim(), password);
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
              <Image
        source={require('../../assets/images/icon.png')}
        className="mx-auto mb-6 h-16 w-16"
        resizeMode="cover"
      />

        <View className="rounded-3xl bg-white px-5 py-8 shadow-sm">
          <Text className="mb-6 text-center text-2xl font-bold text-ink">
            Welcome back!{'\n'}
            <Text className="text-base font-medium text-slate-400">Login to continue</Text>
          </Text>

          {error ? (
            <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
              <Text className="text-center text-sm text-priority-high font-medium">{error}</Text>
            </View>
          ) : null}

          <Text className="mb-1.5 text-sm font-medium text-ink">Email</Text>
          <TextInput
            className="mb-4 rounded-full font-medium border-0 bg-gray-100 px-5 py-3.5 text-base text-ink"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text className="mb-1.5 text-sm font-medium text-ink">Password</Text>
          <View className="mb-3 flex-row items-center rounded-full bg-gray-100 px-5">
            <TextInput
              className="flex-1 py-3.5 text-base font-medium text-ink"
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

          <View className="mb-6 flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center"
              onPress={() => setRemember((v) => !v)}
            >
              <View
                className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                  remember ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                }`}
              >
                {remember ? <Text className="text-xs text-white font-medium">✓</Text> : null}
              </View>
              <Text className="text-sm text-ink-muted font-medium">Remember me</Text>
            </Pressable>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-primary">Forgot password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              submitting ? 'opacity-60' : ''
            }`}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">Login</Text>
            )}
          </TouchableOpacity>

          {/* Social placeholders — not wired yet */}
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

        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-ink-muted font-medium">New here? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="font-semibold text-primary">Create an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}