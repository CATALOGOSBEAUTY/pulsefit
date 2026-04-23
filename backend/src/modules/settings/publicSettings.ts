const PUBLIC_SETTING_KEYS = new Set([
  'whatsapp_phone',
]);

export function normalizePublicSettingsPayload(body: Record<string, unknown>) {
  return Object.entries(body ?? {})
    .filter(([key]) => PUBLIC_SETTING_KEYS.has(key))
    .map(([key, value]) => ({
      key,
      value: String(value ?? '').trim(),
      is_public: true,
    }));
}
