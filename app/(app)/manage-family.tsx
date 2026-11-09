import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFamily } from '../../src/contexts/FamilyContext';
import * as familyService from '../../src/services/family';
import type { Membership, MembershipRole } from '../../src/types';

type MemberRow = Membership & {
  displayName: string;
  email: string;
};

export default function ManageFamilyScreen() {
  const { user } = useAuth();
  const { currentFamily, isAdmin, createInviteCode } = useFamily();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Invite
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!currentFamily?.id) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      const list = await familyService.getMembersForFamily(currentFamily.id);
      const profiles = await familyService.getUsersByIds(list.map((m) => m.userId));

      setMembers(
        list.map((m) => ({
          ...m,
          displayName: profiles[m.userId]?.displayName ?? 'Member',
          email: profiles[m.userId]?.email ?? '',
        }))
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not load members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFamily?.id]);

  useEffect(() => {
    setLoading(true);
    loadMembers();
  }, [loadMembers]);

  // Non-admins should not stay here
  useEffect(() => {
    if (!loading && !isAdmin) {
      Alert.alert('Admins only', 'Only family admins can manage the family.');
      router.back();
    }
  }, [isAdmin, loading]);

  const handleGenerateInvite = async () => {
    if (!currentFamily?.id) return;
    setInviteLoading(true);
    setCopied(false);
    try {
      const invite = await createInviteCode(currentFamily.id, {
        expiresInDays: 7,
        maxUses: null,
      });
      setInviteCode(invite.code);
    } catch (e: any) {
      Alert.alert('Could not create invite', e?.message ?? 'Try again');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangeRole = (member: MemberRow) => {
    if (!user?.uid || !currentFamily?.id) return;
    if (member.userId === user.uid) {
      Alert.alert('Note', 'You cannot change your own role here.');
      return;
    }

    const options: { text: string; role?: MembershipRole; style?: 'cancel' | 'destructive' }[] = [
      { text: 'Make Admin', role: 'admin' },
      { text: 'Make Member', role: 'member' },
      { text: 'Make Viewer', role: 'viewer' },
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert(
      member.displayName,
      `Current role: ${member.role}\nChoose a new role`,
      options.map((o) => ({
        text: o.text,
        style: o.style,
        onPress: async () => {
          if (!o.role || o.role === member.role) return;
          try {
            await familyService.setMemberRole(
              user.uid,
              currentFamily.id,
              member.id,
              o.role
            );
            await loadMembers();
          } catch (e: any) {
            Alert.alert('Could not update role', e?.message ?? 'Try again');
          }
        },
      }))
    );
  };

  const handleRemove = (member: MemberRow) => {
    if (!user?.uid || !currentFamily?.id) return;
    if (member.userId === user.uid) {
      Alert.alert('Note', 'You cannot remove yourself here. Use Sign out / leave later.');
      return;
    }

    Alert.alert(
      'Remove member',
      `Remove ${member.displayName} from this family? They can rejoin with a new invite.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await familyService.removeMember(
                user.uid,
                currentFamily.id,
                member.id,
                member.userId
              );
              await loadMembers();
            } catch (e: any) {
              Alert.alert('Could not remove', e?.message ?? 'Try again');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerClassName="px-5 pb-12 pt-14"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadMembers();
            }}
            tintColor="#7C3AED"
          />
        }
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-bold text-xl text-ink">Manage family</Text>
            <Text className="font-sans text-sm text-ink-muted">
              {currentFamily?.name || 'Family'}
            </Text>
          </View>
        </View>

        {/* Invite section (moved from Home) */}
        <View className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <View className="mb-3 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-light">
              <Ionicons name="link-outline" size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-base text-ink">Invite family</Text>
              <Text className="font-sans text-sm text-ink-muted">
                Share a code · expires in 7 days
              </Text>
            </View>
          </View>

          {inviteCode ? (
            <>
              <View className="mb-3 items-center rounded-2xl bg-surface py-4">
                <Text className="font-bold text-2xl tracking-widest text-primary">
                  {inviteCode}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center rounded-full bg-primary py-3"
                  onPress={handleCopy}
                >
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy-outline'}
                    size={18}
                    color="#fff"
                  />
                  <Text className="ml-2 font-semibold text-sm text-white">
                    {copied ? 'Copied' : 'Copy code'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-full border border-primary/30 bg-primary-light px-4 py-3"
                  onPress={handleGenerateInvite}
                  disabled={inviteLoading}
                >
                  {inviteLoading ? (
                    <ActivityIndicator size="small" color="#7C3AED" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={18} color="#7C3AED" />
                      <Text className="ml-2 font-semibold text-sm text-primary">New</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-full bg-primary py-3.5"
              onPress={handleGenerateInvite}
              disabled={inviteLoading}
            >
              {inviteLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text className="ml-2 font-semibold text-sm text-white">
                    Generate invite code
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Members */}
        <Text className="mb-3 font-semibold text-lg text-ink">
          Members · {members.length}
        </Text>

        {members.map((member) => {
          const isYou = member.userId === user?.uid;
          return (
            <View
              key={member.id}
              className="mb-2 flex-row items-center rounded-2xl bg-white px-4 py-3.5"
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                <Text className="font-bold text-primary">
                  {member.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-base text-ink">
                  {member.displayName}
                  {isYou ? ' (you)' : ''}
                </Text>
                <Text className="font-sans text-sm capitalize text-ink-muted">
                  {member.role}
                  {member.email ? ` · ${member.email}` : ''}
                </Text>
              </View>
              {!isYou && (
                <View className="flex-row">
                  <TouchableOpacity
                    className="mr-2 p-2"
                    onPress={() => handleChangeRole(member)}
                  >
                    <Ionicons name="shield-outline" size={20} color="#7C3AED" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2" onPress={() => handleRemove(member)}>
                    <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}