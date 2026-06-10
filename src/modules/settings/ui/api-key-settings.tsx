"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { ANTHROPIC_MODELS } from "@/modules/settings/domain/anthropic-provider-options";
import {
  deleteApiKeyAction,
  saveApiKeyAction,
  type SettingsActionState,
} from "@/server/actions/settings.action";

const MODEL_LABELS: Record<string, string> = {
  "claude-haiku-4-5-20251001": "Claude Haiku 4.5 — fast, low cost",
  "claude-sonnet-4-6": "Claude Sonnet 4.6 — balanced quality",
};

interface CurrentConfig {
  providerName: string;
  providerModel: string;
}

interface Props {
  currentConfig: CurrentConfig | null;
}

const IDLE: SettingsActionState = { status: "idle" };

export function ApiKeySettings({ currentConfig }: Props) {
  const t = useTranslations("settings");
  const [saveState, saveFormAction, savePending] = useActionState(saveApiKeyAction, IDLE);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteApiKeyAction, IDLE);

  // After save (before page re-render), treat as configured so the status card
  // shows immediately. After delete, force unconfigured state.
  const isConfigured =
    (currentConfig !== null || saveState.status === "saved") && deleteState.status !== "deleted";

  const activeModel =
    currentConfig?.providerModel ?? (saveState.status === "saved" ? ANTHROPIC_MODELS[0] : null);

  return (
    <div className="space-y-6">
      {/* Status card */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">{t("statusTitle")}</h2>
        {isConfigured ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-sm text-zinc-700">{t("status.configured")}</span>
            </div>
            <p className="text-sm text-zinc-500">
              {t("currentProvider", { name: "Anthropic" })}
              {activeModel ? ` · ${MODEL_LABELS[activeModel] ?? activeModel}` : null}
            </p>
            <form action={deleteFormAction}>
              <button
                type="submit"
                disabled={deletePending}
                className="text-sm text-red-600 underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
              >
                {deletePending ? t("deleting") : t("deleteKey")}
              </button>
            </form>
            {deleteState.status === "error" && (
              <p role="alert" className="text-sm text-red-600">
                {deleteState.code === "unauthorized" ? t("error.unauthorized") : t("error.server")}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-300" aria-hidden="true" />
            <span className="text-sm text-zinc-500">{t("fallback")}</span>
          </div>
        )}
      </div>

      {/* Save form */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">
          {isConfigured ? t("updateKey") : t("addKey")}
        </h2>
        <form action={saveFormAction} className="space-y-4">
          <div>
            <label
              htmlFor="providerModel"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              {t("modelLabel")}
            </label>
            <select
              id="providerModel"
              name="providerModel"
              defaultValue={currentConfig?.providerModel ?? ANTHROPIC_MODELS[0]}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none"
            >
              {ANTHROPIC_MODELS.map((m) => (
                <option key={m} value={m}>
                  {MODEL_LABELS[m] ?? m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="apiKey" className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t("apiKeyLabel")}
            </label>
            <input
              id="apiKey"
              name="apiKey"
              type="password"
              required
              autoComplete="off"
              placeholder={t("apiKeyPlaceholder")}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none"
            />
          </div>

          {saveState.status === "saved" && (
            <p role="status" className="text-sm text-green-600">
              {t("saved")}
            </p>
          )}
          {saveState.status === "error" && (
            <p role="alert" className="text-sm text-red-600">
              {saveState.code === "validation"
                ? t("error.validation")
                : saveState.code === "unauthorized"
                  ? t("error.unauthorized")
                  : saveState.code === "encryption-key-missing"
                    ? t("error.encryptionKeyMissing")
                    : t("error.server")}
            </p>
          )}

          <button
            type="submit"
            disabled={savePending}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savePending ? t("saving") : t("saveKey")}
          </button>
        </form>
      </div>
    </div>
  );
}
