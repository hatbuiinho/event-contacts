import type { Handle } from '@sveltejs/kit';

import { isDatabaseConfigured } from '$lib/server/db/client';
import { getSessionUser, sessionCookieName } from '$lib/server/auth/auth-service';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	const token = event.cookies.get(sessionCookieName);
	if (token && isDatabaseConfigured()) {
		try {
			event.locals.user = await getSessionUser(token);
		} catch {
			event.cookies.delete(sessionCookieName, { path: '/' });
		}
	}

	return resolve(event);
};
