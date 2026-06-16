import "server-only";
import { prisma } from "@/shared/db/client";

export interface ProviderConfigRow {
  providerName: string;
  providerModel: string;
  encryptedApiKey: string;
}

// Used by provider-factory to decrypt and instantiate the BYOK provider.
export async function getUserProviderConfig(userId: string): Promise<ProviderConfigRow | null> {
  return prisma.userProviderConfig.findUnique({
    where: { userId },
    select: { providerName: true, providerModel: true, encryptedApiKey: true },
  });
}

export interface ProviderConfigStatus {
  providerName: string;
  providerModel: string;
}

// Used by the settings page — never returns the encrypted key.
export async function getProviderConfigStatus(
  userId: string,
): Promise<ProviderConfigStatus | null> {
  return prisma.userProviderConfig.findUnique({
    where: { userId },
    select: { providerName: true, providerModel: true },
  });
}

export async function upsertUserProviderConfig(
  userId: string,
  data: ProviderConfigRow,
): Promise<void> {
  await prisma.userProviderConfig.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

// Uses deleteMany to be idempotent — safe to call when no row exists.
export async function deleteUserProviderConfig(userId: string): Promise<void> {
  await prisma.userProviderConfig.deleteMany({ where: { userId } });
}
