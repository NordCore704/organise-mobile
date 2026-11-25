import type { PlanId, PlanLimits } from '../types';

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: 'free',
    name: 'Free',
    maxVaultFiles: 10,
    maxVaultBytes: 50 * 1024 * 1024, // 50 MB
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxVaultFiles: 200,
    maxVaultBytes: 2 * 1024 * 1024 * 1024, // 2 GB
  },
};

export function getPlan(planId?: string | null): PlanLimits {
  if (planId === 'pro') return PLANS.pro;
  return PLANS.free;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}