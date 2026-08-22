import { l as isDatabaseConfigured } from "../chunks/schema.js";
import { a as sessionCookieName, i as getSessionUser } from "../chunks/auth-service.js";
//#region src/hooks.server.ts
var handle = async ({ event, resolve }) => {
	event.locals.user = null;
	const token = event.cookies.get(sessionCookieName);
	if (token && isDatabaseConfigured()) try {
		event.locals.user = await getSessionUser(token);
	} catch {
		event.cookies.delete(sessionCookieName, { path: "/" });
	}
	return resolve(event);
};
//#endregion
export { handle };
