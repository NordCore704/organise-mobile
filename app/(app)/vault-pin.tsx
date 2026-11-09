import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVaultLock } from '../../src/contexts/VaultLockContext';

export default function VaultPinScreen() {
  const { pinEnabled, setupPin, changePin, removePin } = useVaultLock();

  const [currentPin, setCurrentPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirm) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    setBusy(true);
    try {
      if (pinEnabled) {
        await changePin(currentPin, pin);
        Alert.alert('Updated', 'Vault PIN changed.');
      } else {
        await setupPin(pin);
        Alert.alert('Enabled', 'Vault PIN is now required to open the Vault.');
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save PIN');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = () => {
    Alert.alert('Remove PIN', 'Vault will open without a PIN on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await removePin(currentPin);
            Alert.alert('Removed', 'Vault PIN disabled.');
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Could not remove');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          paddingTop: 56,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <Text className="mb-2 font-bold text-2xl text-ink">
          {pinEnabled ? 'Change vault PIN' : 'Set vault PIN'}
        </Text>
        <Text className="mb-6 font-sans text-sm text-ink-muted">
          Protects the Vault tab on this device after you sign in.
        </Text>

        <View className="rounded-3xl bg-white px-5 py-6">
          {pinEnabled ? (
            <>
              <Text className="mb-1.5 font-medium text-sm text-ink">
                Current PIN
              </Text>
              <TextInput
                className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 text-center font-semibold tracking-widest text-ink"
                value={currentPin}
                onChangeText={setCurrentPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={8}
              />
            </>
          ) : null}

          <Text className="mb-1.5 font-medium text-sm text-ink">
            {pinEnabled ? 'New PIN' : 'PIN'}
          </Text>
          <TextInput
            className="mb-4 rounded-full bg-gray-100 px-5 py-3.5 text-center font-semibold tracking-widest text-ink"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            placeholder="At least 4 digits"
            placeholderTextColor="#9CA3AF"
          />

          <Text className="mb-1.5 font-medium text-sm text-ink">Confirm PIN</Text>
          <TextInput
            className="mb-6 rounded-full bg-gray-100 px-5 py-3.5 text-center font-semibold tracking-widest text-ink"
            value={confirm}
            onChangeText={setConfirm}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
          />

          <TouchableOpacity
            className={`items-center rounded-full bg-primary py-4 ${
              busy ? 'opacity-60' : ''
            }`}
            onPress={handleSave}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-base text-white">
                {pinEnabled ? 'Update PIN' : 'Enable PIN'}
              </Text>
            )}
          </TouchableOpacity>

          {pinEnabled ? (
            <TouchableOpacity
              className="mt-4 items-center py-3"
              onPress={handleRemove}
              disabled={busy}
            >
              <Text className="font-medium text-sm text-priority-high">
                Remove vault PIN
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}