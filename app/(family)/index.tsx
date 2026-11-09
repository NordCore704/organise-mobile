import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFamily } from '../../src/contexts/FamilyContext';

export default function FamilyHubScreen() {
  const { user, logOut } = useAuth();
  const { families, loading } = useFamily();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="flex-grow px-5 pb-10 pt-16"
    >
      {/* Header */}
      <View className="mb-8 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-medium text-sm text-ink-muted">Welcome</Text>
          <Text className="mt-1 font-bold text-3xl text-ink">
            Hi, {firstName}
          </Text>
          <Text className="mt-2 font-sans text-base leading-6 text-ink-muted">
            Create a family or join one with an invite code to get started.
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
          <Text className="font-bold text-lg text-white">
            {(user?.displayName || 'F').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Actions card */}
      <View className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
        <Text className="mb-4 font-semibold text-lg text-ink">Your family space</Text>

        <TouchableOpacity
          className="mb-3 flex-row items-center rounded-2xl bg-primary px-4 py-4"
          onPress={() => router.push('/(family)/create')}
          activeOpacity={0.85}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-white">Create a Family</Text>
            <Text className="font-sans text-sm text-white/80">
              You’re the first admin
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-2xl border border-primary/20 bg-primary-light px-4 py-4"
          onPress={() => router.push('/(family)/join')}
          activeOpacity={0.85}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
            <Ionicons name="enter-outline" size={20} color="#7C3AED" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-primary">Join a Family</Text>
            <Text className="font-sans text-sm text-ink-muted">
              Use an invite code
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      {/* Existing families */}
      {families.length > 0 && (
        <View className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-semibold text-lg text-ink">Your families</Text>
          {families.map((f) => (
            <View
              key={f.id}
              className="mb-2 flex-row items-center rounded-2xl bg-surface px-4 py-3"
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                <Ionicons name="people" size={18} color="#7C3AED" />
              </View>
              <Text className="flex-1 font-medium text-base text-ink">{f.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sign out */}
      <TouchableOpacity
        className="mt-auto items-center py-4"
        onPress={logOut}
        activeOpacity={0.7}
      >
        <Text className="font-medium text-sm text-priority-high">Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}