/** Backend URL for server-side proxying (Render). */
export function getServerApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000"
  );
}

/**
 * Browser: same-origin `/api/*` (Next.js proxy sets auth cookie on Vercel).
 * Server: direct backend URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return getServerApiBaseUrl();
}
