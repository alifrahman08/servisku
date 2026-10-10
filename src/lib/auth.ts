import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "servisku-secure-default-key-32-chars-long";
const COOKIE_NAME = "servisku_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function createToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      address: true,
      isActive: true,
      technicianProfile: true,
    },
  });

  if (!user || !user.isActive) return null;
  return user;
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = createToken(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
