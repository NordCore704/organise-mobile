import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVault } from '../../../../src/contexts/VaultContext';
import * as vaultService from '../../../../src/services/vault';
import type { VaultCategory, VaultItem } from '../../../../src/types';
import { VaultUnlockGate } from '@/src/components/VaultUnlockGate';

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  note: 'document-text-outline',
  possession: 'cube-outline',
  document: 'document-outline',
  memory_ref: 'images-outline',
};

export default function VaultCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    categoryItems,
    categoryItemsLoading,
    loadCategoryItems,
    clearCategoryItems,
    removeCategory,
    removeItem,
  } = useVault();

  const [category, setCategory] = useState<VaultCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const c = await vaultService.getCategoryById(id);
        if (!cancelled) setCategory(c);
        await loadCategoryItems(id);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Could not open category');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearCategoryItems();
    };
  }, [id]);

  const handleDeleteCategory = () => {
    if (!category) return;
    Alert.alert(
      'Delete category',
      `Delete “${category.title}” and all items inside?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCategory(category.id);
              router.replace('/(app)/(tabs)/vault');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Could not delete');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item: VaultItem) => {
    Alert.alert('Delete item', `Remove “${item.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeItem(item); // passes filePath for Supabase cleanup
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Could not delete');
          }
        },
      },
    ]);
  };

  /** Open attached file or image in browser / system viewer */
  const openItem = async (item: VaultItem) => {
    const url = item.fileUrl || item.imageUrl;
    if (!url) {
      Alert.alert(
        item.title,
        item.description || 'No file attached to this item.'
      );
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Cannot open', 'No app available for this file.');
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not open file');
    }
  };

  if (loading) {
    return (
      <VaultUnlockGate>
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </VaultUnlockGate>
    );
  }

  if (!category) {
    return (
      <VaultUnlockGate>
        <View className="flex-1 items-center justify-center bg-surface">
          <Text className="text-ink">Category not found</Text>
        </View>
      </VaultUnlockGate>
    );
  }

  return (
    <VaultUnlockGate>
      <View className="flex-1 bg-surface">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100 + insets.bottom,
            paddingTop: Math.max(insets.top, 12) + 44,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-5 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
            <View className="flex-1 pr-2">
              <Text className="font-bold text-xl text-ink" numberOfLines={1}>
                {category.title}
              </Text>
              <Text className="font-sans text-sm text-ink-muted">
                {categoryItems.length} item
                {categoryItems.length === 1 ? '' : 's'}
              </Text>
            </View>
            <TouchableOpacity
              className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-white"
              onPress={handleDeleteCategory}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-primary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/add-vault-item',
                  params: { categoryId: category.id },
                })
              }
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {categoryItemsLoading ? (
            <ActivityIndicator color="#7C3AED" style={{ marginTop: 40 }} />
          ) : categoryItems.length === 0 ? (
            <View className="mt-20 items-center px-6">
              <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#EEEAF8]">
                <Ionicons name="documents-outline" size={36} color="#7C3AED" />
              </View>
              <Text className="mb-2 text-center font-bold text-lg text-ink">
                No items
              </Text>
              <Text className="mb-6 text-center font-sans text-sm leading-5 text-ink-muted">
                Add a note, possession, document, or save something from
                Memories.
              </Text>
              <TouchableOpacity
                className="rounded-full bg-primary px-8 py-3.5"
                onPress={() =>
                  router.push({
                    pathname: '/(app)/add-vault-item',
                    params: { categoryId: category.id },
                  })
                }
              >
                <Text className="font-semibold text-sm text-white">
                  Add item
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            categoryItems.map((item) => {
              const hasFile = !!(item.fileUrl || item.imageUrl);
              return (
                <View
                  key={item.id}
                  className="mb-3 flex-row items-center rounded-2xl bg-white px-3 py-3"
                >
                  <TouchableOpacity
                    className="flex-1 flex-row items-center"
                    onPress={() => openItem(item)}
                    activeOpacity={0.85}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 52, height: 52, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#EEEAF8]">
                        <Ionicons
                          name={typeIcon[item.type] || 'document-text-outline'}
                          size={22}
                          color="#7C3AED"
                        />
                      </View>
                    )}
                    <View className="ml-3 flex-1">
                      <Text
                        className="font-semibold text-[15px] text-ink"
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className="mt-0.5 font-sans text-xs capitalize text-ink-muted"
                        numberOfLines={1}
                      >
                        {item.type.replace('_', ' ')}
                        {item.fileName
                          ? ` · ${item.fileName}`
                          : item.description
                            ? ` · ${item.description}`
                            : hasFile
                              ? ' · Tap to open'
                              : ''}
                      </Text>
                    </View>
                    {hasFile ? (
                      <Ionicons
                        name="open-outline"
                        size={18}
                        color="#9CA3AF"
                        style={{ marginRight: 4 }}
                      />
                    ) : null}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="ml-1 h-9 w-9 items-center justify-center"
                    onPress={() => handleDeleteItem(item)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </VaultUnlockGate>
  );
}