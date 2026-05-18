/** Must match backend AUTH_COOKIE_NAME */
export const AUTH_COOKIE_NAME = "token";

const AUTH_COOKIE_MAX_AGE_S = 7 * 24 * 60 * 60;

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_S,
  };
}
