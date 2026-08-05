/**
 * Returns a stable guest device ID persisted in localStorage.
 * Used to correlate guest chat history across page loads without auth.
 * Safe to call in SSR contexts (returns null when window is unavailable).
 */
/**
 * Headers for guest access to chat/Hermes routes, per the backend contract:
 * guest requests are identified by an `x-chat-device-id` header whose value
 * is prefixed with `guest-`. Returns an empty object when unavailable (SSR).
 */
export function guestChatHeaders(): Record<string, string> {
  const deviceId = getGuestDeviceId();
  return deviceId ? { "x-chat-device-id": deviceId } : {};
}

export function getGuestDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const STORAGE_KEY = "shothik_guest_device_id";
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = `guest-${crypto.randomUUID()}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
