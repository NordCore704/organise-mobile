import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVault } from '../../../src/contexts/VaultContext';
import { VaultUnlockGate } from '@/src/components/VaultUnlockGate';

export default function VaultScreen() {
  const { categories, categoriesLoading } = useVault();

  if (categoriesLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <VaultUnlockGate>
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          paddingTop: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-bold text-2xl text-ink">Family Vault</Text>
            <Text className="mt-1 font-sans text-sm text-ink-muted">
              Important notes and items for your family
            </Text>
          </View>
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full bg-primary"
            onPress={() => router.push('/(app)/add-vault-category')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {categories.length === 0 ? (
          <View className="mt-20 items-center px-6">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#EEEAF8]">
              <Ionicons name="lock-closed-outline" size={36} color="#7C3AED" />
            </View>
            <Text className="mb-2 text-center font-bold text-lg text-ink">
              Vault is empty
            </Text>
            <Text className="mb-6 text-center font-sans text-sm leading-5 text-ink-muted">
              Create a category for documents, property, or anything the family
              must find later.
            </Text>
            <TouchableOpacity
              className="rounded-full bg-primary px-8 py-3.5"
              onPress={() => router.push('/(app)/add-vault-category')}
            >
              <Text className="font-semibold text-sm text-white">
                Add category
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className="mb-3 flex-row items-center rounded-2xl bg-white px-4 py-4"
              onPress={() => router.push(`/(app)/vault/category/${cat.id}`)}
              activeOpacity={0.85}
            >
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#EEEAF8]">
                <Ionicons name="folder" size={22} color="#7C3AED" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-[16px] text-ink">
                  {cat.title}
                </Text>
                {cat.description ? (
                  <Text
                    className="mt-0.5 font-sans text-sm text-ink-muted"
                    numberOfLines={1}
                  >
                    {cat.description}
                  </Text>
                ) : (
                  <Text className="mt-0.5 font-sans text-sm text-ink-muted">
                    Vault category
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
    </ VaultUnlockGate>
  );
}