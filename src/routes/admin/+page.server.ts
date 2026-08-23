import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

import { normalizePhone, normalizeText } from '$lib/contacts/normalize';
import { requireAdmin } from '$lib/server/auth/guard';
import { getDb } from '$lib/server/db/client';
import { contacts, departments, events, memberships } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAdmin(locals, '/admin');
	const db = getDb();
	const [event] = await db
		.select({ id: events.id, name: events.name, logoUrl: events.logoUrl })
		.from(events)
		.where(eq(events.status, 'active'))
		.limit(1);
	if (!event) return { user, event: null, contacts: [], departments: [] };

	const [eventContacts, eventDepartments, assignmentRows] = await Promise.all([
		db
			.select({
				id: contacts.id,
				displayName: contacts.displayName,
				title: contacts.title,
				phoneDisplay: contacts.phoneDisplay,
				notes: contacts.notes
			})
			.from(contacts)
			.where(eq(contacts.eventId, event.id))
			.orderBy(asc(contacts.displayName)),
		db
			.select({
				id: departments.id,
				name: departments.name,
				notes: departments.notes,
				sortOrder: departments.sortOrder
			})
			.from(departments)
			.where(eq(departments.eventId, event.id))
			.orderBy(asc(departments.sortOrder), asc(departments.name)),
		db
			.select({
				id: memberships.id,
				contactId: memberships.contactId,
				departmentId: memberships.departmentId,
				departmentName: departments.name,
				role: memberships.role,
				isSupport: memberships.isSupport,
				sortOrder: memberships.sortOrder
			})
			.from(memberships)
			.innerJoin(departments, eq(departments.id, memberships.departmentId))
			.where(eq(departments.eventId, event.id))
			.orderBy(asc(departments.sortOrder), asc(memberships.sortOrder))
	]);

	const membershipsByContact = new Map<string, typeof assignmentRows>();
	for (const assignment of assignmentRows) {
		const list = membershipsByContact.get(assignment.contactId) ?? [];
		list.push(assignment);
		membershipsByContact.set(assignment.contactId, list);
	}
	const contactOrder = new Map<string, number>();
	for (const [index, assignment] of assignmentRows.entries()) {
		if (!contactOrder.has(assignment.contactId)) contactOrder.set(assignment.contactId, index);
	}
	eventContacts.sort(
		(first, second) =>
			(contactOrder.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
			(contactOrder.get(second.id) ?? Number.MAX_SAFE_INTEGER)
	);

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

export const actions = {
	updateEvent: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const eventId = value(form, 'eventId');
		const name = value(form, 'name');
		const logoUrl = value(form, 'logoUrl');
		if (!eventId || !name) return fail(400, { error: 'Tên kỳ lễ không được để trống.' });
		if (logoUrl && !isHttpUrl(logoUrl))
			return fail(400, { error: 'Logo cần là một URL https/http hợp lệ.' });
		await getDb()
			.update(events)
			.set({ name, logoUrl: logoUrl || null, updatedAt: new Date() })
			.where(eq(events.id, eventId));
		return { success: 'Đã lưu thông tin kỳ lễ.' };
	},
	createContact: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const eventId = value(form, 'eventId');
		let input: ReturnType<typeof contactInput>;
		try {
			input = contactInput(form);
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Số điện thoại không hợp lệ.'
			});
		}
		if (!eventId || !input.displayName) return fail(400, { error: 'Nhập tên liên hệ.' });
		try {
			const contactId = crypto.randomUUID();
			await getDb()
				.insert(contacts)
				.values({ id: contactId, eventId, ...input });
			return { success: 'Đã thêm liên hệ.' };
		} catch (error) {
			return fail(400, {
				error:
					error instanceof Error
						? 'Số điện thoại này đã tồn tại trong kỳ lễ.'
						: 'Không thể thêm liên hệ.'
			});
		}
	},
	createContacts: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const eventId = value(form, 'eventId');
		const activeEventId = await getActiveEventId();
		if (!eventId || eventId !== activeEventId)
			return fail(403, { error: 'Đại lễ đang hoạt động đã thay đổi. Vui lòng tải lại trang.' });

		let rows: { displayName?: unknown; phone?: unknown; title?: unknown; notes?: unknown }[];
		try {
			rows = JSON.parse(value(form, 'entries'));
			if (!Array.isArray(rows)) throw new Error();
		} catch {
			return fail(400, { error: 'Dữ liệu liên hệ không hợp lệ.' });
		}

		try {
			const entries = rows.map((row) => {
				const rowForm = new FormData();
				rowForm.set('displayName', String(row.displayName ?? ''));
				rowForm.set('phone', String(row.phone ?? ''));
				rowForm.set('title', String(row.title ?? ''));
				rowForm.set('notes', String(row.notes ?? ''));
				const input = contactInput(rowForm);
				if (!input.displayName) throw new Error('Mỗi dòng cần có họ và tên.');
				return { id: crypto.randomUUID(), eventId, ...input };
			});
			if (entries.length === 0) return fail(400, { error: 'Thêm ít nhất một liên hệ.' });
			const phones = entries
				.map((entry) => entry.phoneDigits)
				.filter((phone): phone is string => !!phone);
			if (new Set(phones).size !== phones.length)
				return fail(400, { error: 'Có số điện thoại bị trùng trong danh sách vừa nhập.' });
			const [firstEntry, ...remainingEntries] = entries;
			if (!firstEntry) return fail(400, { error: 'Thêm ít nhất một liên hệ.' });
			const db = getDb();
			await db.batch([
				db.insert(contacts).values(firstEntry),
				...remainingEntries.map((entry) => db.insert(contacts).values(entry))
			]);
			return { success: `Đã thêm ${entries.length} liên hệ.` };
		} catch (error) {
			return fail(400, {
				error:
					error instanceof Error
						? error.message
						: 'Không thể thêm liên hệ. Kiểm tra các số điện thoại có bị trùng không.'
			});
		}
	},
	updateContact: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const id = value(form, 'id');
		let input: ReturnType<typeof contactInput>;
		try {
			input = contactInput(form);
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Số điện thoại không hợp lệ.'
			});
		}
		if (!id || !input.displayName) return fail(400, { error: 'Nhập tên liên hệ.' });
		try {
			await getDb()
				.update(contacts)
				.set({ ...input, updatedAt: new Date() })
				.where(eq(contacts.id, id));
			return { success: 'Đã cập nhật liên hệ.' };
		} catch {
			return fail(400, { error: 'Số điện thoại này đã tồn tại trong kỳ lễ.' });
		}
	},
	deleteContact: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const id = value(await request.formData(), 'id');
		if (!id) return fail(400, { error: 'Không tìm thấy liên hệ.' });
		await getDb().delete(contacts).where(eq(contacts.id, id));
		return { success: 'Đã xóa liên hệ và các phân công liên quan.' };
	},
	bulkDeleteContacts: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const ids = selectedIds(await request.formData());
		const eventId = await getActiveEventId();
		if (!eventId || ids.length === 0) return fail(400, { error: 'Chọn ít nhất một liên hệ.' });
		await getDb()
			.delete(contacts)
			.where(and(eq(contacts.eventId, eventId), inArray(contacts.id, ids)));
		return { success: `Đã xóa ${ids.length} liên hệ.` };
	},
	bulkMoveContacts: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const ids = selectedIds(form);
		const departmentIds = selectedIds(form, 'departmentIds');
		const eventId = await getActiveEventId();
		if (!eventId || departmentIds.length === 0 || ids.length === 0)
			return fail(400, { error: 'Chọn liên hệ và tiểu ban đích.' });
		const db = getDb();
		const targets = await db
			.select({ id: departments.id })
			.from(departments)
			.where(and(inArray(departments.id, departmentIds), eq(departments.eventId, eventId)));
		if (targets.length !== departmentIds.length)
			return fail(400, { error: 'Tiểu ban đích không hợp lệ.' });
		const validContacts = await db
			.select({ id: contacts.id })
			.from(contacts)
			.where(and(eq(contacts.eventId, eventId), inArray(contacts.id, ids)));
		const contactIds = validContacts.map((contact) => contact.id);
		const sortOrders = await Promise.all(departmentIds.map(getNextMembershipSortOrder));
		await db.batch([
			db.delete(memberships).where(inArray(memberships.contactId, contactIds)),
			...departmentIds.flatMap((departmentId, departmentIndex) =>
				contactIds.map((contactId, contactIndex) =>
					db.insert(memberships).values({
						id: crypto.randomUUID(),
						contactId,
						departmentId,
						sortOrder: sortOrders[departmentIndex] + contactIndex
					})
				)
			)
		]);
		return { success: `Đã chuyển ${contactIds.length} liên hệ sang tiểu ban mới.` };
	},
	createDepartment: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const eventId = value(form, 'eventId');
		const name = value(form, 'name');
		if (!eventId || !name) return fail(400, { error: 'Nhập tên tiểu ban.' });
		try {
			await getDb()
				.insert(departments)
				.values({
					eventId,
					name,
					normalizedName: normalizeText(name),
					sortOrder: await getNextDepartmentSortOrder(eventId)
				});
			return { success: 'Đã thêm tiểu ban.' };
		} catch {
			return fail(400, { error: 'Tiểu ban này đã tồn tại.' });
		}
	},
	moveDepartment: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const id = value(form, 'id');
		const direction = value(form, 'direction');
		if (!id || (direction !== 'up' && direction !== 'down'))
			return fail(400, { error: 'Thao tác sắp xếp không hợp lệ.' });
		const eventId = await getActiveEventId();
		if (!eventId) return fail(404, { error: 'Không có đại lễ đang hoạt động.' });
		const db = getDb();
		const ordered = await db
			.select({ id: departments.id, sortOrder: departments.sortOrder })
			.from(departments)
			.where(eq(departments.eventId, eventId))
			.orderBy(asc(departments.sortOrder), asc(departments.name));
		const index = ordered.findIndex((department) => department.id === id);
		const current = ordered[index];
		const target = ordered[index + (direction === 'up' ? -1 : 1)];
		if (!current || !target) return { success: 'Thứ tự tiểu ban không thay đổi.' };
		await db.batch([
			db
				.update(departments)
				.set({ sortOrder: target.sortOrder, updatedAt: new Date() })
				.where(eq(departments.id, current.id)),
			db
				.update(departments)
				.set({ sortOrder: current.sortOrder, updatedAt: new Date() })
				.where(eq(departments.id, target.id))
		]);
		return { success: 'Đã cập nhật thứ tự tiểu ban.' };
	},
	reorderDepartments: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const ids = selectedIds(await request.formData(), 'order');
		const eventId = await getActiveEventId();
		if (!eventId || ids.length === 0) return fail(400, { error: 'Thứ tự tiểu ban không hợp lệ.' });
		const existing = await getDb()
			.select({ id: departments.id })
			.from(departments)
			.where(eq(departments.eventId, eventId));
		if (
			ids.length !== existing.length ||
			ids.some((id) => !existing.some((department) => department.id === id))
		)
			return fail(400, { error: 'Thứ tự tiểu ban không hợp lệ.' });
		const updates = ids.map((id, sortOrder) =>
			getDb()
				.update(departments)
				.set({ sortOrder, updatedAt: new Date() })
				.where(eq(departments.id, id))
		);
		const [firstUpdate, ...remainingUpdates] = updates;
		if (!firstUpdate) return fail(400, { error: 'Thứ tự tiểu ban không hợp lệ.' });
		await getDb().batch([firstUpdate, ...remainingUpdates]);
		return { success: 'Đã cập nhật thứ tự tiểu ban.' };
	},
	updateDepartment: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const id = value(form, 'id');
		const name = value(form, 'name');
		if (!id || !name) return fail(400, { error: 'Nhập tên tiểu ban.' });
		try {
			await getDb()
				.update(departments)
				.set({ name, normalizedName: normalizeText(name), updatedAt: new Date() })
				.where(eq(departments.id, id));
			return { success: 'Đã cập nhật tiểu ban.' };
		} catch {
			return fail(400, { error: 'Tiểu ban này đã tồn tại.' });
		}
	},
	deleteDepartment: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const id = value(await request.formData(), 'id');
		if (!id) return fail(400, { error: 'Không tìm thấy tiểu ban.' });
		const db = getDb();
		await db.batch([
			db.delete(memberships).where(eq(memberships.departmentId, id)),
			db.delete(departments).where(eq(departments.id, id))
		]);
		return { success: 'Đã xóa tiểu ban và các phân công thuộc ban này.' };
	},
	createMembership: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const form = await request.formData();
		const contactId = value(form, 'contactId');
		const departmentId = value(form, 'departmentId');
		const role = value(form, 'role');
		if (!contactId || !departmentId) return fail(400, { error: 'Chọn liên hệ và tiểu ban.' });
		try {
			await getDb()
				.insert(memberships)
				.values({
					contactId,
					departmentId,
					role,
					isSupport: form.get('isSupport') === 'on',
					sortOrder: await getNextMembershipSortOrder(departmentId)
				});
			return { success: 'Đã thêm phân công.' };
		} catch {
			return fail(400, { error: 'Phân công này đã tồn tại.' });
		}
	},
	deleteMembership: async ({ locals, request }) => {
		requireAdmin(locals, '/admin');
		const id = value(await request.formData(), 'id');
		if (!id) return fail(400, { error: 'Không tìm thấy phân công.' });
		await getDb().delete(memberships).where(eq(memberships.id, id));
		return { success: 'Đã xóa phân công.' };
	}
} satisfies Actions;

function value(form: FormData, key: string) {
	return String(form.get(key) ?? '').trim();
}

function selectedIds(form: FormData, key = 'ids') {
	try {
		const ids = JSON.parse(value(form, key));
		return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

async function getActiveEventId() {
	const [event] = await getDb()
		.select({ id: events.id })
		.from(events)
		.where(eq(events.status, 'active'))
		.limit(1);
	return event?.id ?? null;
}

async function getNextDepartmentSortOrder(eventId: string) {
	const [lastDepartment] = await getDb()
		.select({ sortOrder: departments.sortOrder })
		.from(departments)
		.where(eq(departments.eventId, eventId))
		.orderBy(desc(departments.sortOrder))
		.limit(1);
	return (lastDepartment?.sortOrder ?? -1) + 1;
}

async function getNextMembershipSortOrder(departmentId: string) {
	const [lastMembership] = await getDb()
		.select({ sortOrder: memberships.sortOrder })
		.from(memberships)
		.where(eq(memberships.departmentId, departmentId))
		.orderBy(desc(memberships.sortOrder))
		.limit(1);
	return (lastMembership?.sortOrder ?? -1) + 1;
}

function contactInput(form: FormData) {
	const displayName = value(form, 'displayName');
	const phone = normalizePhone(value(form, 'phone'));
	return {
		displayName,
		normalizedName: normalizeText(displayName),
		title: value(form, 'title') || null,
		phoneDisplay: phone?.display ?? null,
		phoneDigits: phone?.digits ?? null,
		notes: value(form, 'notes') || null
	};
}

function isHttpUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}
