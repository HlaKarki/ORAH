import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDataSource } from "@/db/data-source";
import { User, Session, UserSettings } from "@/db/entities";

const SESSION_COOKIE_NAME = "explainit_session";
const SESSION_DURATION_DAYS = 30;

export function generateSalt(): string {
  return randomBytes(32).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = scryptSync(password, salt, 64);
  const storedHashBuffer = Buffer.from(storedHash, "hex");
  return timingSafeEqual(hash, storedHashBuffer);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<Session> {
  const dataSource = await getDataSource();
  const sessionRepo = dataSource.getRepository(Session);

  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const session = sessionRepo.create({
    token,
    userId,
    expiresAt,
    userAgent: userAgent ?? null,
    ipAddress: ipAddress ?? null,
  });

  await sessionRepo.save(session);
  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function validateSession(): Promise<{ user: User; session: Session } | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const dataSource = await getDataSource();
  const sessionRepo = dataSource.getRepository(Session);

  const session = await sessionRepo.findOne({
    where: { token },
    relations: ["user"],
  });

  if (!session) return null;

  if (session.isExpired) {
    await sessionRepo.remove(session);
    await clearSessionCookie();
    return null;
  }

  if (!session.user || !session.user.isActive) {
    await sessionRepo.remove(session);
    await clearSessionCookie();
    return null;
  }

  return { user: session.user, session };
}

export async function invalidateSession(token: string): Promise<void> {
  const dataSource = await getDataSource();
  const sessionRepo = dataSource.getRepository(Session);
  await sessionRepo.delete({ token });
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  const dataSource = await getDataSource();
  const sessionRepo = dataSource.getRepository(Session);
  await sessionRepo.delete({ userId });
}

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<User> {
  const dataSource = await getDataSource();
  const userRepo = dataSource.getRepository(User);
  const settingsRepo = dataSource.getRepository(UserSettings);

  const existingUser = await userRepo.findOne({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);

  const user = userRepo.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash,
    passwordSalt: salt,
  });

  await userRepo.save(user);

  const settings = settingsRepo.create({
    userId: user.id,
  });
  await settingsRepo.save(settings);

  return user;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const dataSource = await getDataSource();
  const userRepo = dataSource.getRepository(User);

  const user = await userRepo.findOne({ where: { email: email.toLowerCase() } });
  if (!user) return null;

  if (!user.isActive) return null;

  const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  fullName: string;
}

export function serializeUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase(),
    fullName: `${user.firstName} ${user.lastName}`,
  };
}
