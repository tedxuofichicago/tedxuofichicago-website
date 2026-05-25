const raw = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? "";

const allowedEmails = raw
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (allowedEmails.length === 0) return false;
  return allowedEmails.includes(email.toLowerCase());
}

export function getAllowedAdminEmails(): string[] {
  return [...allowedEmails];
}
