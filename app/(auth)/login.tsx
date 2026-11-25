// app/(auth)/login.tsx
import { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  useGoogleAuthRequest,
  signInWithGoogleIdToken,
} from '../../src/services/googleAuth';
import { ensureUserProfile } from '../../src/services/auth';

export default function LoginScreen() {
  const { signIn, error, clearError } = useAuth();
  const { request, response, promptAsync } = useGoogleAuthRequest();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle Google redirect / result
  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.params?.id_token;
    if (!idToken) {
      Alert.alert('Google sign-in', 'No ID token returned. Check your Web client ID.');
      return;
    }

    let cancelled = false;

    (async () => {
      setGoogleLoading(true);
      clearError();
      try {
        const user = await signInWithGoogleIdToken(idToken);
        await ensureUserProfile(user);
        // AuthContext onAuthStateChanged routes into the app
      } catch (e: any) {
        if (!cancelled) {
          Alert.alert(
            'Google sign-in failed',
            e?.message ?? 'Something went wrong. Try again.'
          );
        }
      } finally {
        if (!cancelled) setGoogleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [response]);

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
      // error surface via AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!request) {
      Alert.alert(
        'Google sign-in',
        'Google auth is not ready yet. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and restart Metro.'
      );
      return;
    }
    clearError();
    await promptAsync();
  };

  const busy = submitting || googleLoading;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingVertical: 40,
        }}
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
            <Text className="text-base font-medium text-slate-400">
              Login to continue
            </Text>
          </Text>

          {error ? (
            <View className="mb-4 rounded-xl bg-red-50 px-3 py-2">
              <Text className="text-center text-sm font-medium text-priority-high">
                {error}
              </Text>
            </View>
          ) : null}

          <Text className="mb-1.5 text-sm font-medium text-ink">Email</Text>
          <TextInput
            className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 text-base font-medium text-ink"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            editable={!busy}
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
              editable={!busy}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Text className="text-sm font-medium text-ink-muted">
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
                  remember
                    ? 'border-primary bg-primary'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {remember ? (
                  <Text className="text-xs font-medium text-white">✓</Text>
                ) : null}
              </View>
              <Text className="text-sm font-medium text-ink-muted">
                Remember me
              </Text>
            </Pressable>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-primary">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              busy ? 'opacity-60' : ''
            }`}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-gray-200" />
            <Text className="mx-3 text-sm font-medium text-ink-muted">or</Text>
            <View className="h-px flex-1 bg-gray-200" />
          </View>

          {/* Google */}
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-full border border-gray-200 bg-white py-3.5 ${
              busy || !request ? 'opacity-60' : ''
            }`}
            onPress={handleGoogle}
            disabled={busy || !request}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color="#7C3AED" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#111827" />
                <Text className="ml-2 text-base font-semibold text-ink">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-8 flex-row items-center justify-center">
          <Text className="font-medium text-ink-muted">New here? </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            disabled={busy}
          >
            <Text className="font-semibold text-primary">Create an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}