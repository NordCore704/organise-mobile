import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useMemories } from "../../../src/contexts/MemoriesContext";
import * as albumsService from "../../../src/services/albums";
import * as familyService from "../../../src/services/family";
import type { Album, Memory } from "../../../src/types";
import { PhotoActionsModal } from "@/components/PhotoActionsModal";

const PAD = 20;
const GAP = 12;
const COL = (Dimensions.get("window").width - PAD * 2 - GAP) / 2;

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    albumMemories,
    albumMemoriesLoading,
    loadAlbumMemories,
    clearAlbumMemories,
    removeMemory,
    setVisibility,
    deleteAlbum,
  } = useMemories();

  const [album, setAlbum] = useState<Album | null>(null);
  const [albumLoading, setAlbumLoading] = useState(true);
  const [visibilityMemory, setVisibilityMemory] = useState<Memory | null>(null);
  const [visibilityBusy, setVisibilityBusy] = useState(false);
  const [actionsMemory, setActionsMemory] = useState<Memory | null>(null);
  const [actionsBusy, setActionsBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setAlbumLoading(true);
      try {
        const a = await albumsService.getAlbumById(id);
        if (!cancelled) setAlbum(a);
        await loadAlbumMemories(id);
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Could not open folder");
      } finally {
        if (!cancelled) setAlbumLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearAlbumMemories();
    };
  }, [id]);

  const handleDeleteFolder = () => {
    if (!album) return;
    Alert.alert(
      "Delete folder",
      `Delete “${album.title}” and all photos inside?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAlbum(album.id);
              router.replace("/(app)/(tabs)/memories");
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Could not delete");
            }
          },
        },
      ],
    );
  };

  const handleDelete = (memory: Memory) => {
    Alert.alert("Delete photo", "Remove this photo from the folder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeMemory(memory);
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Could not delete");
          }
        },
      },
    ]);
  };

  const openMemberPicker = async (memory: Memory) => {
    if (!album?.familyId || !user?.uid) return;
    try {
      const memberships = await familyService.getMembersForFamily(
        album.familyId,
      );
      const profiles = await familyService.getUsersByIds(
        memberships.map((m) => m.userId),
      );
      const choices = memberships.filter((m) => m.userId !== user.uid);
      if (choices.length === 0) {
        Alert.alert("No other members", "Invite family members first.");
        return;
      }
      const selected = new Set<string>(memory.allowedUserIds ?? []);
      const askNext = (index: number) => {
        if (index >= choices.length) {
          const ids = Array.from(selected);
          setVisibility(memory.id, "members", ids)
            .then(() =>
              Alert.alert(
                "Updated",
                ids.length
                  ? `Visible to ${ids.length} selected member(s).`
                  : "Only you can see it.",
              ),
            )
            .catch((e: any) => Alert.alert("Error", e?.message ?? "Failed"));
          return;
        }
        const m = choices[index];
        const name = profiles[m.userId]?.displayName || "Member";
        const isOn = selected.has(m.userId);
        Alert.alert(name, isOn ? "Currently allowed." : "Currently hidden.", [
          {
            text: isOn ? "Remove access" : "Allow access",
            onPress: () => {
              if (isOn) selected.delete(m.userId);
              else selected.add(m.userId);
              askNext(index + 1);
            },
          },
          { text: "Keep as is", onPress: () => askNext(index + 1) },
          { text: "Cancel", style: "cancel" },
        ]);
      };
      askNext(0);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not load members");
    }
  };


  if (albumLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!album) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="font-semibold text-ink">Folder not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-primary">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: PAD,
          paddingBottom: 100,
          paddingTop: 56,
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
              {album.title}
            </Text>
            {album.description ? (
              <Text
                className="font-sans text-sm text-ink-muted"
                numberOfLines={1}
              >
                {album.description}
              </Text>
            ) : (
              <Text className="font-sans text-sm text-ink-muted">
                {albumMemories.length} photo
                {albumMemories.length === 1 ? "" : "s"}
              </Text>
            )}
          </View>
          <TouchableOpacity
            className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={handleDeleteFolder}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-primary"
            onPress={() =>
              router.push({
                pathname: "/(app)/add-memory",
                params: { albumId: album.id },
              })
            }
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {albumMemoriesLoading ? (
          <ActivityIndicator color="#7C3AED" style={{ marginTop: 40 }} />
        ) : albumMemories.length === 0 ? (
          <View className="mt-20 items-center px-6">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#EEEAF8]">
              <Ionicons name="image-outline" size={36} color="#7C3AED" />
            </View>
            <Text className="mb-2 text-center font-bold text-lg text-ink">
              No photos yet
            </Text>
            <Text className="mb-6 text-center font-sans text-sm leading-5 text-ink-muted">
              Add the first photo to this folder.
            </Text>
            <TouchableOpacity
              className="rounded-full bg-primary px-8 py-3.5"
              onPress={() =>
                router.push({
                  pathname: "/(app)/add-memory",
                  params: { albumId: album.id },
                })
              }
            >
              <Text className="font-semibold text-sm text-white">
                Add photo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: GAP }}>
            {albumMemories.map((memory, index) => (
              <View
                key={memory.id}
                style={{ width: COL }}
                className="overflow-hidden rounded-2xl bg-white"
              >
                <View className="relative">
                  <TouchableOpacity
                    activeOpacity={0.95}
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/album/viewer",
                        params: { startIndex: String(index) },
                      })
                    }
                  >
                    {memory.imageUrl ? (
                      <Image
                        source={{ uri: memory.imageUrl }}
                        style={{ width: "100%", aspectRatio: 1 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{ width: "100%", aspectRatio: 1 }}
                        className="items-center justify-center bg-[#EEEAF8]"
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={28}
                          color="#C4B5FD"
                        />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* ⋯ actions — clean overlay like wireframe hearts */}
                  <TouchableOpacity
                    className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/40"
                    onPress={() => setActionsMemory(memory)}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={16}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>

                {memory.caption ? (
                  <Text
                    className="px-2.5 py-2 font-sans text-xs text-ink-muted"
                    numberOfLines={2}
                  >
                    {memory.caption}
                  </Text>
                ) : (
                  <View className="h-2" />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
     
<PhotoActionsModal
  visible={!!actionsMemory}
  memory={actionsMemory}
  busy={actionsBusy}
  onClose={() => !actionsBusy && setActionsMemory(null)}
  onSaveToVault={() => {
    const m = actionsMemory;
    setActionsMemory(null);
    if (!m || !album) return;
    router.push({
      pathname: '/(app)/save-to-vault',
      params: {
        memoryId: m.id,
        albumId: album.id,
        imageUrl: m.imageUrl || '',
        caption: m.caption || '',
        title: m.caption || album.title || 'Family memory',
      },
    });
  }}
  onDelete={() => {
    const m = actionsMemory;
    setActionsMemory(null);
    if (m) handleDelete(m); // can still confirm with Alert, or inline later
  }}
  onSelectFamily={async () => {
    if (!actionsMemory) return;
    setActionsBusy(true);
    try {
      await setVisibility(actionsMemory.id, 'family');
      setActionsMemory(null);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed');
    } finally {
      setActionsBusy(false);
    }
  }}
  onSelectMembers={() => {
    const m = actionsMemory;
    setActionsMemory(null);
    if (m) openMemberPicker(m);
  }}
  onSelectLink={async () => {
    if (!actionsMemory) return;
    setActionsBusy(true);
    try {
      const token = await setVisibility(actionsMemory.id, 'link');
      if (token) {
        await Clipboard.setStringAsync(`family-app://memory/${token}`);
      }
      setActionsMemory(null);
      Alert.alert('Link sharing on', 'Share link copied.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed');
    } finally {
      setActionsBusy(false);
    }
  }}
/>
    </View>
  );
}
