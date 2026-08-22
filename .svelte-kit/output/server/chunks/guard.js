import { redirect } from "@sveltejs/kit";
//#region src/lib/server/auth/guard.ts
function requireAdmin(locals, next = "/admin/import") {
	if (locals.user?.role !== "admin") throw redirect(303, `/login?next=${encodeURIComponent(next)}`);
	return locals.user;
}
//#endregion
export { requireAdmin as t };
