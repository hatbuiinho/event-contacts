import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { and, eq, gt } from 'drizzle-orm';

import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db/client';
import { sessions, users } from '$lib/server/db/schema';

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export const sessionCookieName = 'event_contacts_session';
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export type AuthUser = App.Locals['user'] & {};

export async function authenticate(
	username: string,
	password: string
): Promise<NonNullable<AuthUser> | null> {
	const db = getDb();
	await ensureInitialAdmin();
	const normalizedUsername = username.trim().toLocaleLowerCase('en-US');
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.username, normalizedUsername))
		.limit(1);
	if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) return null;

	return { id: user.id, username: user.username, displayName: user.displayName, role: user.role };
}

export async function createSession(userId: string): Promise<string> {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);
	await getDb()
		.insert(sessions)
		.values({ id: crypto.randomUUID(), userId, tokenHash: hashToken(token), expiresAt });
	return token;
}

export async function getSessionUser(token: string): Promise<NonNullable<AuthUser> | null> {
	const [result] = await getDb()
		.select({
			id: users.id,
			username: users.username,
			displayName: users.displayName,
			role: users.role
		})
		.from(sessions)
		.innerJoin(users, eq(users.id, sessions.userId))
		.where(
			and(
				eq(sessions.tokenHash, hashToken(token)),
				gt(sessions.expiresAt, new Date()),
				eq(users.active, true)
			)
		)
		.limit(1);
	return result ?? null;
}

export async function deleteSession(token: string): Promise<void> {
	await getDb()
		.delete(sessions)
		.where(eq(sessions.tokenHash, hashToken(token)));
}

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;
	return `${salt.toString('base64url')}:${derivedKey.toString('base64url')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltValue, keyValue] = storedHash.split(':');
	if (!saltValue || !keyValue) return false;

	try {
		const expected = Buffer.from(keyValue, 'base64url');
		const actual = (await scrypt(
			password,
			Buffer.from(saltValue, 'base64url'),
			keyLength
		)) as Buffer;
		return expected.length === actual.length && timingSafeEqual(expected, actual);
	} catch {
		return false;
	}
}

async function ensureInitialAdmin(): Promise<void> {
	const [existingUser] = await getDb().select({ id: users.id }).from(users).limit(1);
	if (existingUser) return;

	const username = env.INITIAL_ADMIN_USERNAME?.trim().toLocaleLowerCase('en-US');
	const password = env.INITIAL_ADMIN_PASSWORD;
	if (!username || !password) {
		throw new Error(
			'INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD are required for first login'
		);
	}

	await getDb()
		.insert(users)
		.values({
			id: crypto.randomUUID(),
			username,
			displayName: env.INITIAL_ADMIN_DISPLAY_NAME?.trim() || 'Ban quản trị',
			passwordHash: await hashPassword(password),
			role: 'admin'
		});
}

function hashToken(token: string): string {
	if (!env.SESSION_SECRET) {
		throw new Error('SESSION_SECRET is required to manage sessions');
	}
	return createHmac('sha256', env.SESSION_SECRET).update(token).digest('base64url');
}
