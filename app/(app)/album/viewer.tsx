import { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemories } from '../../../src/contexts/MemoriesContext';

const { width, height } = Dimensions.get('window');

export default function AlbumViewerScreen() {
  const { startIndex } = useLocalSearchParams<{ startIndex?: string }>();
  const { albumMemories } = useMemories();

  const initial = Math.min(
    Math.max(parseInt(startIndex || '0', 10) || 0, 0),
    Math.max(albumMemories.length - 1, 0)
  );

  const [index, setIndex] = useState(initial);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  if (albumMemories.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">No photos</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-primary">Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Top bar */}
      <View
        className="absolute left-0 right-0 z-10 flex-row items-center justify-between px-4"
        style={{ top: 48 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="font-medium text-sm text-white">
          {index + 1} / {albumMemories.length}
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        ref={listRef}
        data={albumMemories}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initial}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View
            style={{ width, height }}
            className="items-center justify-center"
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width, height: height * 0.75 }}
                resizeMode="contain"
              />
            ) : (
              <Text className="text-white">No image</Text>
            )}
            {item.caption ? (
              <Text
                className="absolute bottom-24 px-6 text-center text-sm text-white/90"
                numberOfLines={3}
              >
                {item.caption}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}