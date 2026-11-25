import { getPlan, formatBytes } from '../config/plans';
import * as vaultService from './vault';
import type { PlanLimits, VaultUsage } from '../types';

export type LimitCheckResult =
  | { ok: true; usage: VaultUsage; plan: PlanLimits }
  | { ok: false; reason: string; usage: VaultUsage; plan: PlanLimits };

/**
 * Call before uploading a new vault file.
 * extraBytes = size of the file about to upload (0 if unknown).
 */
export async function canAddVaultFile(
  familyId: string,
  planId: string | null | undefined,
  extraBytes: number = 0
): Promise<LimitCheckResult> {
  const plan = getPlan(planId);
  const usage = await vaultService.getVaultUsageForFamily(familyId);

  if (usage.fileCount >= plan.maxVaultFiles) {
    return {
      ok: false,
      reason: `Vault file limit reached (${plan.maxVaultFiles} on ${plan.name}). Upgrade for more space.`,
      usage,
      plan,
    };
  }

  if (usage.totalBytes + extraBytes > plan.maxVaultBytes) {
    return {
      ok: false,
      reason: `Vault storage limit reached (${formatBytes(plan.maxVaultBytes)} on ${plan.name}).`,
      usage,
      plan,
    };
  }

  return { ok: true, usage, plan };
}