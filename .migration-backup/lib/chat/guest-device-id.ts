/**
 * Returns a stable guest device ID persisted in localStorage.
 * Used to correlate guest chat history across page loads without auth.
 * Safe to call in SSR contexts (returns null when window is unavailable).
 */
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
