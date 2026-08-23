import { and, asc, eq, ilike, like, or } from 'drizzle-orm';

import { normalizeText } from '$lib/contacts/normalize';
import { getDb } from '$lib/server/db/client';
import { contacts, departments, events, memberships } from '$lib/server/db/schema';

export type DirectoryContact = {
	id: string;
	displayName: string;
	phoneDisplay: string | null;
	phoneDigits: string | null;
	departments: { id: string; name: string; role: string; isSupport: boolean; sortOrder: number }[];
};

export async function getActiveDirectory(input: { query: string; departmentId: string | null }) {
	const db = getDb();
	const [event] = await db
		.select({ id: events.id, name: events.name, logoUrl: events.logoUrl })
		.from(events)
		.where(eq(events.status, 'active'))
		.limit(1);
	if (!event) return { event: null, contacts: [], departments: [] };

	const activeDepartments = await db
		.select({ id: departments.id, name: departments.name })
		.from(departments)
		.where(eq(departments.eventId, event.id))
		.orderBy(asc(departments.sortOrder), asc(departments.name));

	const predicates = [eq(contacts.eventId, event.id)];
	if (input.departmentId) predicates.push(eq(departments.id, input.departmentId));

	const normalizedQuery = normalizeText(input.query);
	const phoneQuery = input.query.replace(/\D/g, '');
	if (normalizedQuery || phoneQuery) {
		const searchPredicates = [];
		if (normalizedQuery) {
			searchPredicates.push(
				ilike(contacts.normalizedName, `%${normalizedQuery}%`),
				ilike(departments.normalizedName, `%${normalizedQuery}%`)
			);
		}
		if (phoneQuery) searchPredicates.push(like(contacts.phoneDigits, `%${phoneQuery}%`));
		const searchClause = or(...searchPredicates);
		if (searchClause) predicates.push(searchClause);
	}

	const rows = await db
		.select({
			id: contacts.id,
			displayName: contacts.displayName,
			phoneDisplay: contacts.phoneDisplay,
			phoneDigits: contacts.phoneDigits,
			departmentId: departments.id,
			departmentName: departments.name,
			role: memberships.role,
			isSupport: memberships.isSupport,
			membershipSortOrder: memberships.sortOrder
		})
		.from(contacts)
		.innerJoin(memberships, eq(memberships.contactId, contacts.id))
		.innerJoin(departments, eq(departments.id, memberships.departmentId))
		.where(and(...predicates))
		.orderBy(asc(departments.sortOrder), asc(memberships.sortOrder), asc(contacts.displayName));

	const contactsById = new Map<string, DirectoryContact>();
	for (const row of rows) {
		const contact = contactsById.get(row.id) ?? {
			id: row.id,
			displayName: row.displayName,
			phoneDisplay: row.phoneDisplay,
			phoneDigits: row.phoneDigits,
			departments: []
		};
		contact.departments.push({
			id: row.departmentId,
			name: row.departmentName,
			role: row.role,
			isSupport: row.isSupport,
			sortOrder: row.membershipSortOrder
		});
		contactsById.set(row.id, contact);
	}

	return { event, contacts: [...contactsById.values()], departments: activeDepartments };
}
