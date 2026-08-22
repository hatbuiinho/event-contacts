import { n as normalizeText, t as normalizePhone } from "../../../chunks/normalize.js";
import { a as memberships, c as getDb, n as departments, r as events, t as contacts } from "../../../chunks/schema.js";
import { t as requireAdmin } from "../../../chunks/guard.js";
import { fail } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
//#region src/routes/admin/+page.server.ts
var load = async ({ locals }) => {
	const user = requireAdmin(locals, "/admin");
	const db = getDb();
	const [event] = await db.select({
		id: events.id,
		name: events.name,
		logoUrl: events.logoUrl
	}).from(events).where(eq(events.status, "active")).limit(1);
	if (!event) return {
		user,
		event: null,
		contacts: [],
		departments: []
	};
	const [eventContacts, eventDepartments, assignmentRows] = await Promise.all([
		db.select({
			id: contacts.id,
			displayName: contacts.displayName,
			title: contacts.title,
			phoneDisplay: contacts.phoneDisplay,
			notes: contacts.notes
		}).from(contacts).where(eq(contacts.eventId, event.id)).orderBy(asc(contacts.displayName)),
		db.select({
			id: departments.id,
			name: departments.name,
			notes: departments.notes
		}).from(departments).where(eq(departments.eventId, event.id)).orderBy(asc(departments.sortOrder), asc(departments.name)),
		db.select({
			id: memberships.id,
			contactId: memberships.contactId,
			departmentId: memberships.departmentId,
			departmentName: departments.name,
			role: memberships.role,
			isSupport: memberships.isSupport
		}).from(memberships).innerJoin(departments, eq(departments.id, memberships.departmentId)).where(eq(departments.eventId, event.id))
	]);
	const membershipsByContact = /* @__PURE__ */ new Map();
	for (const assignment of assignmentRows) {
		const list = membershipsByContact.get(assignment.contactId) ?? [];
		list.push(assignment);
		membershipsByContact.set(assignment.contactId, list);
	}
	return {
		user,
		event,
		departments: eventDepartments,
		contacts: eventContacts.map((contact) => ({
			...contact,
			memberships: membershipsByContact.get(contact.id) ?? []
		}))
	};
};
var actions = {
	updateEvent: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const form = await request.formData();
		const eventId = value(form, "eventId");
		const name = value(form, "name");
		const logoUrl = value(form, "logoUrl");
		if (!eventId || !name) return fail(400, { error: "Tên kỳ lễ không được để trống." });
		if (logoUrl && !isHttpUrl(logoUrl)) return fail(400, { error: "Logo cần là một URL https/http hợp lệ." });
		await getDb().update(events).set({
			name,
			logoUrl: logoUrl || null,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(events.id, eventId));
		return { success: "Đã lưu thông tin kỳ lễ." };
	},
	createContact: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const form = await request.formData();
		const eventId = value(form, "eventId");
		let input;
		try {
			input = contactInput(form);
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : "Số điện thoại không hợp lệ." });
		}
		if (!eventId || !input.displayName) return fail(400, { error: "Nhập tên liên hệ." });
		try {
			const contactId = crypto.randomUUID();
			await getDb().insert(contacts).values({
				id: contactId,
				eventId,
				...input
			});
			return { success: "Đã thêm liên hệ." };
		} catch (error) {
			return fail(400, { error: error instanceof Error ? "Số điện thoại này đã tồn tại trong kỳ lễ." : "Không thể thêm liên hệ." });
		}
	},
	createContacts: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const form = await request.formData();
		const eventId = value(form, "eventId");
		const activeEventId = await getActiveEventId();
		if (!eventId || eventId !== activeEventId) return fail(403, { error: "Đại lễ đang hoạt động đã thay đổi. Vui lòng tải lại trang." });
		let rows;
		try {
			rows = JSON.parse(value(form, "entries"));
			if (!Array.isArray(rows)) throw new Error();
		} catch {
			return fail(400, { error: "Dữ liệu liên hệ không hợp lệ." });
		}
		try {
			const entries = rows.map((row) => {
				const rowForm = new FormData();
				rowForm.set("displayName", String(row.displayName ?? ""));
				rowForm.set("phone", String(row.phone ?? ""));
				rowForm.set("title", String(row.title ?? ""));
				rowForm.set("notes", String(row.notes ?? ""));
				const input = contactInput(rowForm);
				if (!input.displayName) throw new Error("Mỗi dòng cần có họ và tên.");
				return {
					id: crypto.randomUUID(),
					eventId,
					...input
				};
			});
			if (entries.length === 0) return fail(400, { error: "Thêm ít nhất một liên hệ." });
			const phones = entries.map((entry) => entry.phoneDigits).filter((phone) => !!phone);
			if (new Set(phones).size !== phones.length) return fail(400, { error: "Có số điện thoại bị trùng trong danh sách vừa nhập." });
			const [firstEntry, ...remainingEntries] = entries;
			if (!firstEntry) return fail(400, { error: "Thêm ít nhất một liên hệ." });
			const db = getDb();
			await db.batch([db.insert(contacts).values(firstEntry), ...remainingEntries.map((entry) => db.insert(contacts).values(entry))]);
			return { success: `Đã thêm ${entries.length} liên hệ.` };
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : "Không thể thêm liên hệ. Kiểm tra các số điện thoại có bị trùng không." });
		}
	},
	updateContact: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const form = await request.formData();
		const id = value(form, "id");
		let input;
		try {
			input = contactInput(form);
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : "Số điện thoại không hợp lệ." });
		}
		if (!id || !input.displayName) return fail(400, { error: "Nhập tên liên hệ." });
		try {
			await getDb().update(contacts).set({
				...input,
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(contacts.id, id));
			return { success: "Đã cập nhật liên hệ." };
		} catch {
			return fail(400, { error: "Số điện thoại này đã tồn tại trong kỳ lễ." });
		}
	},
	deleteContact: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const id = value(await request.formData(), "id");
		if (!id) return fail(400, { error: "Không tìm thấy liên hệ." });
		await getDb().delete(contacts).where(eq(contacts.id, id));
		return { success: "Đã xóa liên hệ và các phân công liên quan." };
	},
	createDepartment: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const form = await request.formData();
		const eventId = value(form, "eventId");
		const name = value(form, "name");
		if (!eventId || !name) return fail(400, { error: "Nhập tên tiểu ban." });
		try {
			await getDb().insert(departments).values({
				eventId,
				name,
				normalizedName: normalizeText(name)
			});
			return { success: "Đã thêm tiểu ban." };
		} catch {
			return fail(400, { error: "Tiểu ban này đã tồn tại." });
		}
	},
	updateDepartment: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const form = await request.formData();
		const id = value(form, "id");
		const name = value(form, "name");
		if (!id || !name) return fail(400, { error: "Nhập tên tiểu ban." });
		try {
			await getDb().update(departments).set({
				name,
				normalizedName: normalizeText(name),
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(departments.id, id));
			return { success: "Đã cập nhật tiểu ban." };
		} catch {
			return fail(400, { error: "Tiểu ban này đã tồn tại." });
		}
	},
	deleteDepartment: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const id = value(await request.formData(), "id");
		if (!id) return fail(400, { error: "Không tìm thấy tiểu ban." });
		const db = getDb();
		await db.batch([db.delete(memberships).where(eq(memberships.departmentId, id)), db.delete(departments).where(eq(departments.id, id))]);
		return { success: "Đã xóa tiểu ban và các phân công thuộc ban này." };
	},
	createMembership: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const form = await request.formData();
		const contactId = value(form, "contactId");
		const departmentId = value(form, "departmentId");
		const role = value(form, "role");
		if (!contactId || !departmentId) return fail(400, { error: "Chọn liên hệ và tiểu ban." });
		try {
			await getDb().insert(memberships).values({
				contactId,
				departmentId,
				role,
				isSupport: form.get("isSupport") === "on"
			});
			return { success: "Đã thêm phân công." };
		} catch {
			return fail(400, { error: "Phân công này đã tồn tại." });
		}
	},
	deleteMembership: async ({ locals, request }) => {
		requireAdmin(locals, "/admin");
		const id = value(await request.formData(), "id");
		if (!id) return fail(400, { error: "Không tìm thấy phân công." });
		await getDb().delete(memberships).where(eq(memberships.id, id));
		return { success: "Đã xóa phân công." };
	}
};
function value(form, key) {
	return String(form.get(key) ?? "").trim();
}
async function getActiveEventId() {
	const [event] = await getDb().select({ id: events.id }).from(events).where(eq(events.status, "active")).limit(1);
	return event?.id ?? null;
}
function contactInput(form) {
	const displayName = value(form, "displayName");
	const phone = normalizePhone(value(form, "phone"));
	return {
		displayName,
		normalizedName: normalizeText(displayName),
		title: value(form, "title") || null,
		phoneDisplay: phone?.display ?? null,
		phoneDigits: phone?.digits ?? null,
		notes: value(form, "notes") || null
	};
}
function isHttpUrl(value) {
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return false;
	}
}
//#endregion
export { actions, load };
