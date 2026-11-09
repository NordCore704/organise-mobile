/**
 * Vault PIN — stored as SHA-256 hash in SecureStore (device only).
 * Never store the plain PIN.
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PIN_HASH_KEY = 'family_app_vault_pin_hash';
const PIN_ENABLED_KEY = 'family_app_vault_pin_enabled';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `vault:${pin}`
  );
}

export async function isVaultPinEnabled(): Promise<boolean> {
  const enabled = await SecureStore.getItemAsync(PIN_ENABLED_KEY);
  const hash = await SecureStore.getItemAsync(PIN_HASH_KEY);
  return enabled === '1' && !!hash;
}

export async function setVaultPin(pin: string): Promise<void> {
  const cleaned = pin.trim();
  if (cleaned.length < 4) {
    throw new Error('PIN must be at least 4 digits');
  }
  const hash = await hashPin(cleaned);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  await SecureStore.setItemAsync(PIN_ENABLED_KEY, '1');
}

export async function verifyVaultPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!stored) return false;
  const hash = await hashPin(pin.trim());
  return hash === stored;
}

export async function changeVaultPin(
  currentPin: string,
  newPin: string
): Promise<void> {
  const ok = await verifyVaultPin(currentPin);
  if (!ok) throw new Error('Current PIN is incorrect');
  await setVaultPin(newPin);
}

export async function removeVaultPin(currentPin: string): Promise<void> {
  const ok = await verifyVaultPin(currentPin);
  if (!ok) throw new Error('Current PIN is incorrect');
  await SecureStore.deleteItemAsync(PIN_HASH_KEY);
  await SecureStore.setItemAsync(PIN_ENABLED_KEY, '0');
}