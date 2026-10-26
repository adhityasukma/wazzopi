import { SignJWT, jwtVerify } from "jose";

export type Role = "ADMIN" | "KARYAWAN" | "CUSTOMER";

export type SessionPayload = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export const SESSION_COOKIE = "wz_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function getKey() {
  const secret = process.env.AUTH_SECRET || "wazzopi-dev-secret-ganti-di-production-32chars";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
