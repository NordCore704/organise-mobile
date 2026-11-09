import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import type { Memory, MemoryVisibility } from '../types';

type Mode = 'menu' | 'visibility';

type Props = {
  visible: boolean;
  memory: Memory | null;
  busy?: boolean;
  onClose: () => void;
  onSaveToVault: () => void;
  onDelete: () => void;
  onSelectFamily: () => void;
  onSelectMembers: () => void;
  onSelectLink: () => void;
};

export function PhotoActionsModal({
  visible,
  memory,
  busy = false,
  onClose,
  onSaveToVault,
  onDelete,
  onSelectFamily,
  onSelectMembers,
  onSelectLink,
}: Props) {
  const [mode, setMode] = React.useState<Mode>('menu');

  // Reset to main menu whenever a new memory is opened
  React.useEffect(() => {
    if (visible) setMode('menu');
  }, [visible, memory?.id]);

  const current: MemoryVisibility = memory?.visibility ?? 'family';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : mode === 'menu' ? (
            <>
              <Text style={styles.title} className="text-lg font-bold">
                Photo options
              </Text>
              <Text style={styles.subtitle} className="text-medium font-medium text-gray-500">
                Manage this memory for your family
              </Text>

              <ActionRow
                icon="eye-outline"
                label="Visibility"
                subtitle={
                  current === 'link'
                    ? 'Anyone with the link'
                    : current === 'members'
                      ? 'Selected members'
                      : 'Family only'
                }
                onPress={() => setMode('visibility')}
              />
              <ActionRow
                icon="lock-closed-outline"
                label="Save to Vault"
                subtitle="File under a vault category"
                onPress={onSaveToVault}
                
              />
              <ActionRow
                icon="trash-outline"
                label="Delete"
                subtitle="Remove this photo"
                danger
                onPress={onDelete}
              />

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText} className="text-lg font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.backRow}
                onPress={() => setMode('menu')}
              >
                <Ionicons name="arrow-back" size={20} color="#111827" />
                <Text style={styles.backText} className="text-lg font-bold">
                  Visibility
                </Text>
              </TouchableOpacity>
              <Text style={styles.subtitle} className="text-medium font-medium text-gray-500">
                Who can see this photo?
              </Text>

              <ActionRow
                icon="people-outline"
                label="Family only"
                subtitle="Everyone in this family"
                active={current === 'family'}
                onPress={onSelectFamily}
              />
              <ActionRow
                icon="person-outline"
                label="Selected members"
                subtitle="Choose specific people"
                active={current === 'members'}
                onPress={onSelectMembers}
              />
              <ActionRow
                icon="link-outline"
                label="Anyone with the link"
                subtitle="Copy a share link"
                active={current === 'link'}
                onPress={onSelectLink}
              />

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText} className="text-lg font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ActionRow({
  icon,
  label,
  subtitle,
  onPress,
  active,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        active && styles.rowActive,
        danger && styles.rowDanger,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.iconWrap,
          active && styles.iconWrapActive,
          danger && styles.iconWrapDanger,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#EF4444' : active ? '#fff' : '#7C3AED'}
        />
      </View>
      <View style={styles.rowText}>
        <Text className='font-bold' style={[styles.rowLabel, danger && { color: '#EF4444' }]}>
          {label}
        </Text>
        <Text className='text-gray-500 font-medium' style={styles.rowSub}>
          {subtitle}
        </Text>
      </View>
      {active ? (
        <Ionicons name="checkmark-circle" size={22} color="#7C3AED" />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rowActive: {
    backgroundColor: '#EDE9FE',
  },
  rowDanger: {
    backgroundColor: '#FEF2F2',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapActive: {
    backgroundColor: '#7C3AED',
  },
  iconWrapDanger: {
    backgroundColor: '#FEE2E2',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  busy: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});