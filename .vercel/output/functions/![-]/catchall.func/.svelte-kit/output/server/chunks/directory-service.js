import { n as normalizeText } from "./normalize.js";
import { a as memberships, c as getDb, n as departments, r as events, t as contacts } from "./schema.js";
import { and, asc, eq, ilike, like, or } from "drizzle-orm";
//#region src/lib/server/contacts/directory-service.ts
async function getActiveDirectory(input) {
	const db = getDb();
	const [event] = await db.select({
		id: events.id,
		name: events.name,
		logoUrl: events.logoUrl
	}).from(events).where(eq(events.status, "active")).limit(1);
	if (!event) return {
		event: null,
		contacts: [],
		departments: []
	};
	const activeDepartments = await db.select({
		id: departments.id,
		name: departments.name
	}).from(departments).where(eq(departments.eventId, event.id)).orderBy(asc(departments.sortOrder), asc(departments.name));
	const predicates = [eq(contacts.eventId, event.id)];
	if (input.departmentId) predicates.push(eq(departments.id, input.departmentId));
	const normalizedQuery = normalizeText(input.query);
	const phoneQuery = input.query.replace(/\D/g, "");
	if (normalizedQuery || phoneQuery) {
		const searchPredicates = [];
		if (normalizedQuery) searchPredicates.push(ilike(contacts.normalizedName, `%${normalizedQuery}%`), ilike(departments.normalizedName, `%${normalizedQuery}%`));
		if (phoneQuery) searchPredicates.push(like(contacts.phoneDigits, `%${phoneQuery}%`));
		const searchClause = or(...searchPredicates);
		if (searchClause) predicates.push(searchClause);
	}
	const rows = await db.select({
		id: contacts.id,
		displayName: contacts.displayName,
		phoneDisplay: contacts.phoneDisplay,
		phoneDigits: contacts.phoneDigits,
		departmentId: departments.id,
		departmentName: departments.name,
		role: memberships.role,
		isSupport: memberships.isSupport
	}).from(contacts).innerJoin(memberships, eq(memberships.contactId, contacts.id)).innerJoin(departments, eq(departments.id, memberships.departmentId)).where(and(...predicates)).orderBy(asc(contacts.displayName), asc(departments.sortOrder));
	const contactsById = /* @__PURE__ */ new Map();
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
			isSupport: row.isSupport
		});
		contactsById.set(row.id, contact);
	}
	return {
		event,
		contacts: [...contactsById.values()],
		departments: activeDepartments
	};
}
//#endregion
export { getActiveDirectory as t };
