import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFamily } from '../../src/contexts/FamilyContext';
import { useVaultLock } from '@/src/contexts/VaultLockContext';

export default function SettingsScreen() {
  const { user, logOut } = useAuth();
  const { currentFamily, currentRole, families } = useFamily();
  const {  pinEnabled, lock } = useVaultLock();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logOut();
            // Root layout will send the user to welcome/login
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Could not sign out');
          }
        },
      },
    ]);
  };

  const initial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-5 pb-12 pt-14">
        {/* Header */}
        <View className="mb-8 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="font-bold text-xl text-ink">Settings</Text>
        </View>

        {/* Profile card */}
        <View className="mb-6 items-center rounded-3xl bg-white px-5 py-8 shadow-sm">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Text className="font-bold text-3xl text-white">{initial}</Text>
          </View>
          <Text className="font-bold text-xl text-ink">
            {user?.displayName || 'User'}
          </Text>
          <Text className="mt-1 font-sans text-base text-ink-muted">
            {user?.email || '—'}
          </Text>
        </View>

        {/* Account details */}
        <Text className="mb-2 font-semibold text-sm text-ink-muted">ACCOUNT</Text>
        <View className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <Row label="Display name" value={user?.displayName || '—'} />
          <Divider />
          <Row label="Email" value={user?.email || '—'} />
        </View>

        {/* Family details */}
        <Text className="mb-2 font-semibold text-sm text-ink-muted">FAMILY</Text>
        <View className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <Row
            label="Current family"
            value={currentFamily?.name || 'None'}
          />
          <Divider />
          <Row
            label="Your role"
            value={currentRole ? currentRole : '—'}
          />
          <Divider />
          <Row
            label="Families joined"
            value={String(families.length)}
          />
        </View>

<Text className="mb-2 font-semibold text-sm text-ink-muted">VAULT SECURITY</Text>
<View className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm">
  <TouchableOpacity
    className="flex-row items-center justify-between px-4 py-3.5"
    onPress={() => router.push('/(app)/vault-pin')}
  >
    <Text className="font-medium text-sm text-ink">
      {pinEnabled ? 'Change vault PIN' : 'Set vault PIN'}
    </Text>
    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
  </TouchableOpacity>
  {pinEnabled ? (
    <>
      <View className="ml-4 h-px bg-gray-100" />
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3.5"
        onPress={() => {
          lock();
          Alert.alert('Vault locked', 'PIN will be required next time.');
        }}
      >
        <Text className="font-medium text-sm text-ink">Lock vault now</Text>
        <Ionicons name="lock-closed-outline" size={18} color="#7C3AED" />
      </TouchableOpacity>
    </>
  ) : null}
</View>

        {/* Sign out */}
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-2xl bg-white py-4 shadow-sm"
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="ml-2 font-semibold text-base text-priority-high">
            Sign out
          </Text>
        </TouchableOpacity>

        <Text className="mt-8 text-center font-sans text-xs text-ink-muted">
          Family App · v1
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <Text className="font-medium text-sm text-ink-muted">{label}</Text>
      <Text
        className="ml-4 flex-1 text-right font-medium text-sm capitalize text-ink"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="ml-4 h-px bg-gray-100" />;
}