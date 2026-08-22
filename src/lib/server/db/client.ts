import { env } from '$env/dynamic/private';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function getDb() {
	if (!env.DATABASE_URL) {
		throw new Error('DATABASE_URL is required to connect to Neon');
	}

	return drizzle({ client: neon(env.DATABASE_URL) });
}

export function isDatabaseConfigured(): boolean {
	return Boolean(env.DATABASE_URL);
}
