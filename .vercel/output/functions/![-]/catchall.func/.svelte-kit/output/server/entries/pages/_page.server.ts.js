import { n as normalizeText, t as normalizePhone } from "../../chunks/normalize.js";
import { c as getDb, l as isDatabaseConfigured, r as events, t as contacts } from "../../chunks/schema.js";
import { t as getActiveDirectory } from "../../chunks/directory-service.js";
import { t as requireAdmin } from "../../chunks/guard.js";
import { fail } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
//#region src/routes/+page.server.ts
var load = async ({ locals, url }) => {
	const query = url.searchParams.get("q")?.trim() ?? "";
	const departmentId = url.searchParams.get("department")?.trim() || null;
	const editId = locals.user?.role === "admin" ? url.searchParams.get("edit")?.trim() || null : null;
	if (!isDatabaseConfigured()) return {
		configured: false,
		databaseError: false,
		isAdmin: false,
		user: null,
		editId: null,
		query,
		departmentId,
		event: null,
		contacts: [],
		departments: []
	};
	try {
		return {
			configured: true,
			databaseError: false,
			isAdmin: locals.user?.role === "admin",
			user: locals.user ? {
				displayName: locals.user.displayName,
				username: locals.user.username
			} : null,
			editId,
			query,
			departmentId,
			...await getActiveDirectory({
				query,
				departmentId
			})
		};
	} catch (error) {
		console.error("[directory] database connection failed", error);
		return {
			configured: true,
			databaseError: true,
			isAdmin: false,
			user: null,
			editId: null,
			query,
			departmentId,
			event: null,
			contacts: [],
			departments: []
		};
	}
};
var actions = { updateContact: async ({ locals, request }) => {
	requireAdmin(locals, "/");
	const form = await request.formData();
	const id = String(form.get("id") ?? "").trim();
	const displayName = String(form.get("displayName") ?? "").trim();
	if (!id || !displayName) return fail(400, { error: "Nhập tên liên hệ." });
	try {
		const phone = normalizePhone(String(form.get("phone") ?? ""));
		const [activeEvent] = await getDb().select({ id: events.id }).from(events).where(eq(events.status, "active")).limit(1);
		if (!activeEvent) return fail(404, { error: "Không có đại lễ đang hoạt động." });
		await getDb().update(contacts).set({
			displayName,
			normalizedName: normalizeText(displayName),
			phoneDisplay: phone?.display ?? null,
			phoneDigits: phone?.digits ?? null,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(and(eq(contacts.id, id), eq(contacts.eventId, activeEvent.id)));
		return { success: "Đã cập nhật liên hệ." };
	} catch (error) {
		return fail(400, { error: error instanceof Error ? error.message : "Không thể cập nhật liên hệ." });
	}
} };
//#endregion
export { actions, load };
