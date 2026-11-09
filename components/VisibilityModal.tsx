import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Memory, MemoryVisibility } from '../types';

type Props = {
  visible: boolean;
  memory: Memory | null;
  busy?: boolean;
  onClose: () => void;
  onSelectFamily: () => void;
  onSelectMembers: () => void;
  onSelectLink: () => void;
};

function OptionRow({
  icon,
  label,
  subtitle,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className={`mb-2 flex-row items-center rounded-2xl px-4 py-3.5 ${
        active ? 'bg-primary-light' : 'bg-surface'
      }`}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
          active ? 'bg-primary' : 'bg-white'
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={active ? '#fff' : '#7C3AED'}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`font-semibold text-[15px] ${
            active ? 'text-primary' : 'text-ink'
          }`}
        >
          {label}
        </Text>
        <Text className="mt-0.5 font-sans text-xs text-ink-muted">
          {subtitle}
        </Text>
      </View>
      {active ? (
        <Ionicons name="checkmark-circle" size={22} color="#7C3AED" />
      ) : null}
    </TouchableOpacity>
  );
}

export function VisibilityModal({
  visible,
  memory,
  busy = false,
  onClose,
  onSelectFamily,
  onSelectMembers,
  onSelectLink,
}: Props) {
  const current: MemoryVisibility = memory?.visibility ?? 'family';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dimmed backdrop */}
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        {/* Sheet — stop press from closing when tapping content */}
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-10 pt-3"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-gray-200" />
          </View>

          <Text className="mb-1 font-bold text-xl text-ink">
            Who can see this?
          </Text>
          <Text className="mb-5 font-sans text-sm text-ink-muted">
            Control who in the family can view this photo.
          </Text>

          {busy ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : (
            <>
              <OptionRow
                icon="people-outline"
                label="Family only"
                subtitle="Everyone in this family"
                active={current === 'family'}
                onPress={onSelectFamily}
              />
              <OptionRow
                icon="person-outline"
                label="Selected members"
                subtitle="Choose specific people"
                active={current === 'members'}
                onPress={onSelectMembers}
              />
              <OptionRow
                icon="link-outline"
                label="Anyone with the link"
                subtitle="Share a link (copied when enabled)"
                active={current === 'link'}
                onPress={onSelectLink}
              />
            </>
          )}

          <TouchableOpacity
            className="mt-3 items-center rounded-full bg-surface py-3.5"
            onPress={onClose}
          >
            <Text className="font-semibold text-base text-ink">Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}