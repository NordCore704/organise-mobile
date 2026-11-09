import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemories } from '../../../src/contexts/MemoriesContext';
import type { Album } from '../../../src/types';

const PAD = 20;
const GAP = 12;
const COL = (Dimensions.get('window').width - PAD * 2 - GAP) / 2;

export default function MemoriesScreen() {
  const { albums, albumsLoading } = useMemories();

  if (albumsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: PAD,
          paddingBottom: 100,
          paddingTop: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-5 flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-bold text-2xl text-ink">Memories</Text>
            <Text className="mt-1 font-sans text-sm text-ink-muted">
              Shared moments with your family
            </Text>
          </View>
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full bg-primary"
            onPress={() => router.push('/(app)/add-album')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {albums.length === 0 ? (
          <View className="mt-20 items-center px-6">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#EEEAF8]">
              <Ionicons name="folder-open-outline" size={36} color="#7C3AED" />
            </View>
            <Text className="mb-2 text-center font-bold text-lg text-ink">
              No folders yet
            </Text>
            <Text className="mb-6 text-center font-sans text-sm leading-5 text-ink-muted">
              Create a folder, then add photos your family can look back on
              together.
            </Text>
            <TouchableOpacity
              className="rounded-full bg-primary px-8 py-3.5"
              onPress={() => router.push('/(app)/add-album')}
              activeOpacity={0.85}
            >
              <Text className="font-semibold text-sm text-white">
                Create folder
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: GAP }}>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} width={COL} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function AlbumCard({ album, width }: { album: Album; width: number }) {
  return (
    <TouchableOpacity
      style={{ width }}
      className="overflow-hidden rounded-2xl bg-white"
      activeOpacity={0.9}
      onPress={() => router.push(`/(app)/album/${album.id}`)}
    >
      {album.coverUrl ? (
        <Image
          source={{ uri: album.coverUrl }}
          style={{ width: '100%', aspectRatio: 1 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ width: '100%', aspectRatio: 1 }}
          className="items-center justify-center bg-[#EEEAF8]"
        >
          <Ionicons name="images-outline" size={36} color="#C4B5FD" />
        </View>
      )}
      <View className="px-3 pb-3 pt-2.5">
        <Text className="font-semibold text-[15px] text-ink" numberOfLines={1}>
          {album.title}
        </Text>
        <Text className="mt-0.5 font-sans text-xs text-ink-muted" numberOfLines={1}>
          {album.description || 'Family album'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}