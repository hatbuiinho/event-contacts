import { t as private_env } from "./shared-server.js";
import { c as getDb, o as sessions, s as users } from "./schema.js";
import { and, eq, gt } from "drizzle-orm";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
//#region src/lib/server/auth/auth-service.ts
var scrypt$1 = promisify(scrypt);
var keyLength = 64;
var sessionCookieName = "event_contacts_session";
var sessionMaxAgeSeconds = 2592e3;
async function authenticate(username, password) {
	const db = getDb();
	await ensureInitialAdmin();
	const normalizedUsername = username.trim().toLocaleLowerCase("en-US");
	const [user] = await db.select().from(users).where(eq(users.username, normalizedUsername)).limit(1);
	if (!user || !user.active || !await verifyPassword(password, user.passwordHash)) return null;
	return {
		id: user.id,
		username: user.username,
		displayName: user.displayName,
		role: user.role
	};
}
async function createSession(userId) {
	const token = randomBytes(32).toString("base64url");
	const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1e3);
	await getDb().insert(sessions).values({
		id: crypto.randomUUID(),
		userId,
		tokenHash: hashToken(token),
		expiresAt
	});
	return token;
}
async function getSessionUser(token) {
	const [result] = await getDb().select({
		id: users.id,
		username: users.username,
		displayName: users.displayName,
		role: users.role
	}).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, /* @__PURE__ */ new Date()), eq(users.active, true))).limit(1);
	return result ?? null;
}
async function deleteSession(token) {
	await getDb().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}
async function hashPassword(password) {
	const salt = randomBytes(16);
	const derivedKey = await scrypt$1(password, salt, keyLength);
	return `${salt.toString("base64url")}:${derivedKey.toString("base64url")}`;
}
async function verifyPassword(password, storedHash) {
	const [saltValue, keyValue] = storedHash.split(":");
	if (!saltValue || !keyValue) return false;
	try {
		const expected = Buffer.from(keyValue, "base64url");
		const actual = await scrypt$1(password, Buffer.from(saltValue, "base64url"), keyLength);
		return expected.length === actual.length && timingSafeEqual(expected, actual);
	} catch {
		return false;
	}
}
async function ensureInitialAdmin() {
	const [existingUser] = await getDb().select({ id: users.id }).from(users).limit(1);
	if (existingUser) return;
	const username = private_env.INITIAL_ADMIN_USERNAME?.trim().toLocaleLowerCase("en-US");
	const password = private_env.INITIAL_ADMIN_PASSWORD;
	if (!username || !password) throw new Error("INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD are required for first login");
	await getDb().insert(users).values({
		id: crypto.randomUUID(),
		username,
		displayName: private_env.INITIAL_ADMIN_DISPLAY_NAME?.trim() || "Ban quản trị",
		passwordHash: await hashPassword(password),
		role: "admin"
	});
}
function hashToken(token) {
	if (!private_env.SESSION_SECRET) throw new Error("SESSION_SECRET is required to manage sessions");
	return createHmac("sha256", private_env.SESSION_SECRET).update(token).digest("base64url");
}
//#endregion
export { sessionCookieName as a, getSessionUser as i, createSession as n, sessionMaxAgeSeconds as o, deleteSession as r, authenticate as t };
