"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { auth } from "@/auth";
import {
  deleteUserProviderConfig,
  upsertUserProviderConfig,
} from "@/modules/reviews/infrastructure/db/user-provider-config-repository";
import { encrypt } from "@/shared/security/crypto";

export const ANTHROPIC_MODELS = ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"] as const;
export type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];

const saveApiKeySchema = z.object({
  providerModel: z.enum(ANTHROPIC_MODELS),
  apiKey: z.string().min(1, "API key is required.").max(500),
});

export type SettingsActionState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "deleted" }
  | { status: "error"; code: "unauthorized" | "validation" | "encryption-key-missing" | "server" };

export async function saveApiKeyAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id ?? undefined;
  } catch {
    // Auth not configured.
  }
  if (!userId) return { status: "error", code: "unauthorized" };

  const parsed = saveApiKeySchema.safeParse({
    providerModel: formData.get("providerModel"),
    apiKey: formData.get("apiKey"),
  });
  if (!parsed.success) return { status: "error", code: "validation" };

  let encryptedApiKey: string;
  try {
    encryptedApiKey = encrypt(parsed.data.apiKey);
  } catch (err) {
    if (err instanceof Error && err.message.includes("ENCRYPTION_KEY")) {
      return { status: "error", code: "encryption-key-missing" };
    }
    Sentry.captureException(err);
    return { status: "error", code: "server" };
  }

  try {
    await upsertUserProviderConfig(userId, {
      providerName: "anthropic",
      providerModel: parsed.data.providerModel,
      encryptedApiKey,
    });
    return { status: "saved" };
  } catch (err) {
    Sentry.captureException(err);
    return { status: "error", code: "server" };
  }
}

export async function deleteApiKeyAction(
  _prev: SettingsActionState,
  _formData: FormData,
): Promise<SettingsActionState> {
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id ?? undefined;
  } catch {
    // Auth not configured.
  }
  if (!userId) return { status: "error", code: "unauthorized" };

  try {
    await deleteUserProviderConfig(userId);
    return { status: "deleted" };
  } catch (err) {
    Sentry.captureException(err);
    return { status: "error", code: "server" };
  }
}
