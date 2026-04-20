// Simple client-side admin gate. Password hardcoded per user request.
// NOTE: This is low-security; suitable for personal-use admin panel only.
export const ADMIN_PASSWORD = "venmurasu2026";
const KEY = "vm_admin_auth";

export const isAdmin = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export const loginAdmin = (pw: string) => {
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  sessionStorage.removeItem(KEY);
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0B80-\u0BFF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || `item-${Date.now()}`;
