import { and, eq } from 'drizzle-orm';

import { prepareAssignmentImport, type ImportPreview } from '$lib/contacts/import-plan';
import { getDb } from '$lib/server/db/client';
import {
	contacts,
	departmentGroups,
	departments,
	events,
	importBatches,
	memberships
} from '$lib/server/db/schema';

export function previewImport(raw: string): ImportPreview {
	return prepareAssignmentImport(raw);
}

export async function createDraftEventFromImport(input: {
	eventName: string;
	raw: string;
}): Promise<{ eventId: string; preview: ImportPreview }> {
	const eventName = input.eventName.trim();
	if (!eventName) throw new Error('Tên kỳ lễ không được để trống');

	const prepared = prepareAssignmentImport(input.raw);
	const errors = prepared.parse.issues.filter((issue) => issue.severity === 'error');
	if (errors.length > 0) throw new Error('Cần xử lý các dòng lỗi trước khi import');
	if (prepared.memberships.length === 0)
		throw new Error('Không tìm thấy phân công hợp lệ để import');

	const eventId = crypto.randomUUID();
	const db = getDb();
	await db.batch([
		db.insert(events).values({ id: eventId, name: eventName, status: 'draft' }),
		...prepared.contacts.map((contact) => db.insert(contacts).values({ ...contact, eventId })),
		...prepared.departments.map((department) =>
			db.insert(departments).values({ ...department, eventId })
		),
		...prepared.groups.map((group) => db.insert(departmentGroups).values(group)),
		...prepared.memberships.map((membership) => db.insert(memberships).values(membership)),
		db.insert(importBatches).values({
			id: crypto.randomUUID(),
			eventId,
			sourceType: 'assignment-text',
			rowCount: prepared.parse.assignments.length,
			summary: {
				contacts: prepared.contactCount,
				departments: prepared.departmentCount,
				memberships: prepared.memberships.length,
				missingPhones: prepared.missingPhoneCount,
				needsReview: prepared.needsReviewCount
			}
		})
	]);

	return { eventId, preview: prepared };
}

export async function activateEvent(eventId: string): Promise<void> {
	const db = getDb();
	const [draftEvent] = await db
		.select({ id: events.id })
		.from(events)
		.where(and(eq(events.id, eventId), eq(events.status, 'draft')))
		.limit(1);
	if (!draftEvent) throw new Error('Kỳ lễ nháp không tồn tại hoặc đã được kích hoạt');

	await db.batch([
		db
			.update(events)
			.set({ status: 'archived', updatedAt: new Date() })
			.where(eq(events.status, 'active')),
		db
			.update(events)
			.set({ status: 'active', activatedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(events.id, eventId), eq(events.status, 'draft')))
	]);
}
