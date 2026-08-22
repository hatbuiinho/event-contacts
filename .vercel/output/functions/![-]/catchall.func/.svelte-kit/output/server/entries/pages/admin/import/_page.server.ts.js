import { n as normalizeText, r as splitTitle, t as normalizePhone } from "../../../../chunks/normalize.js";
import { a as memberships, c as getDb, i as importBatches, n as departments, r as events, t as contacts } from "../../../../chunks/schema.js";
import { t as requireAdmin } from "../../../../chunks/guard.js";
import { fail } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
//#region src/lib/contacts/assignment-text-parser.ts
function parseAssignmentText(raw) {
	const assignments = [];
	const issues = [];
	let departmentName = "";
	let role = "";
	for (const [index, originalLine] of raw.replace(/\r\n?/g, "\n").split("\n").entries()) {
		const lineNumber = index + 1;
		const line = originalLine.trim();
		if (!line) continue;
		if (/^PHÂN CÔNG\b/iu.test(line)) continue;
		const department = parseDepartmentHeading(line);
		if (department) {
			departmentName = department;
			role = "";
			continue;
		}
		const roleHeading = parseRoleHeading(line);
		if (roleHeading) {
			role = roleHeading;
			continue;
		}
		const assignment = parsePersonLine(line, lineNumber, departmentName, role, issues);
		if (assignment) {
			assignments.push(assignment);
			continue;
		}
		if (looksLikeUnassignedPerson(line)) issues.push({
			line: lineNumber,
			severity: "warning",
			message: "Không nhận diện được người hoặc số điện thoại ở dòng này"
		});
	}
	return {
		assignments,
		issues
	};
}
function parseDepartmentHeading(line) {
	const withoutNumber = line.replace(/^\d+\.\s*/, "");
	if (/^(?:TIỂU BAN|BAN)\b/iu.test(withoutNumber)) return withoutNumber;
	return withoutNumber.length >= 8 && /[\p{L}]/u.test(withoutNumber) && withoutNumber === withoutNumber.toLocaleUpperCase("vi-VN") && !/^(?:PHÂN CÔNG|NHÂN SỰ LỄ)/iu.test(withoutNumber) ? withoutNumber : null;
}
function parseRoleHeading(line) {
	const value = line.replace(/^[-+•]\s*/, "").trim();
	if (!value.endsWith(":")) return null;
	return value.slice(0, -1).trim() || null;
}
function parsePersonLine(line, lineNumber, departmentName, contextRole, issues) {
	const value = line.replace(/^[-+•]\s*/, "").trim();
	const separator = /\s+[–—-]\s+/.exec(value);
	if (!separator || separator.index === void 0) return null;
	let beforePhone = value.slice(0, separator.index).trim();
	const phoneSource = value.slice(separator.index + separator[0].length).trim();
	let role = contextRole;
	const inlineRole = /^(.*?):\s+(.+)$/.exec(beforePhone);
	if (inlineRole) {
		role = inlineRole[1].trim();
		beforePhone = inlineRole[2].trim();
	}
	if (!departmentName) {
		issues.push({
			line: lineNumber,
			severity: "error",
			message: "Người này chưa thuộc tiểu ban nào"
		});
		return null;
	}
	const isSupport = /\(\s*hỗ trợ\s*\)/iu.test(beforePhone);
	const displayName = beforePhone.replace(/\s*\(\s*hỗ trợ\s*\)/giu, "").trim();
	if (!displayName) {
		issues.push({
			line: lineNumber,
			severity: "error",
			message: "Tên người không được để trống"
		});
		return null;
	}
	let phoneDisplay = null;
	let phoneDigits = null;
	try {
		const phone = normalizePhone(phoneSource);
		phoneDisplay = phone?.display ?? null;
		phoneDigits = phone?.digits ?? null;
	} catch (error) {
		issues.push({
			line: lineNumber,
			severity: "error",
			message: error instanceof Error ? error.message : "Số điện thoại không hợp lệ"
		});
		return null;
	}
	const { title } = splitTitle(displayName);
	return {
		sourceLine: lineNumber,
		departmentName,
		departmentNormalizedName: normalizeText(departmentName),
		displayName,
		normalizedName: normalizeText(displayName),
		title,
		phoneDisplay,
		phoneDigits,
		role,
		isSupport
	};
}
function looksLikeUnassignedPerson(line) {
	return /^[-+•]\s*(?:Thầy|Chú|CS)\b/iu.test(line) || /chưa có sđt/iu.test(line);
}
//#endregion
//#region src/lib/contacts/import-plan.ts
function prepareAssignmentImport(raw) {
	const parse = parseAssignmentText(raw);
	const contactsByKey = /* @__PURE__ */ new Map();
	const departmentsByName = /* @__PURE__ */ new Map();
	const membershipsByKey = /* @__PURE__ */ new Map();
	let missingPhoneCount = 0;
	let needsReviewCount = 0;
	for (const assignment of parse.assignments) {
		const contact = ensureContact(assignment, contactsByKey);
		const department = ensureDepartment(assignment, departmentsByName);
		if (!assignment.phoneDigits) {
			missingPhoneCount += 1;
			needsReviewCount += 1;
		}
		const membershipKey = `${contact.id}:${department.id}:${assignment.role}`;
		if (!membershipsByKey.has(membershipKey)) membershipsByKey.set(membershipKey, {
			id: crypto.randomUUID(),
			contactId: contact.id,
			departmentId: department.id,
			role: assignment.role,
			isSupport: assignment.isSupport
		});
	}
	return {
		parse,
		contacts: [...contactsByKey.values()],
		departments: [...departmentsByName.values()],
		memberships: [...membershipsByKey.values()],
		contactCount: contactsByKey.size,
		departmentCount: departmentsByName.size,
		missingPhoneCount,
		duplicateAssignmentCount: parse.assignments.length - membershipsByKey.size,
		needsReviewCount
	};
}
function ensureContact(assignment, contactsByKey) {
	const key = assignment.phoneDigits ? `phone:${assignment.phoneDigits}` : `name:${assignment.normalizedName}`;
	const existing = contactsByKey.get(key);
	if (existing) return existing;
	const contact = {
		id: crypto.randomUUID(),
		displayName: assignment.displayName,
		normalizedName: assignment.normalizedName,
		title: assignment.title,
		phoneDisplay: assignment.phoneDisplay,
		phoneDigits: assignment.phoneDigits
	};
	contactsByKey.set(key, contact);
	return contact;
}
function ensureDepartment(assignment, departmentsByName) {
	const existing = departmentsByName.get(assignment.departmentNormalizedName);
	if (existing) return existing;
	const department = {
		id: crypto.randomUUID(),
		name: assignment.departmentName,
		normalizedName: assignment.departmentNormalizedName,
		sortOrder: departmentsByName.size
	};
	departmentsByName.set(assignment.departmentNormalizedName, department);
	return department;
}
//#endregion
//#region src/lib/server/contacts/import-service.ts
function previewImport(raw) {
	return prepareAssignmentImport(raw);
}
async function createDraftEventFromImport(input) {
	const eventName = input.eventName.trim();
	if (!eventName) throw new Error("Tên kỳ lễ không được để trống");
	const prepared = prepareAssignmentImport(input.raw);
	if (prepared.parse.issues.filter((issue) => issue.severity === "error").length > 0) throw new Error("Cần xử lý các dòng lỗi trước khi import");
	if (prepared.memberships.length === 0) throw new Error("Không tìm thấy phân công hợp lệ để import");
	const eventId = crypto.randomUUID();
	const db = getDb();
	await db.batch([
		db.insert(events).values({
			id: eventId,
			name: eventName,
			status: "draft"
		}),
		...prepared.contacts.map((contact) => db.insert(contacts).values({
			...contact,
			eventId
		})),
		...prepared.departments.map((department) => db.insert(departments).values({
			...department,
			eventId
		})),
		...prepared.memberships.map((membership) => db.insert(memberships).values(membership)),
		db.insert(importBatches).values({
			id: crypto.randomUUID(),
			eventId,
			sourceType: "assignment-text",
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
	return {
		eventId,
		preview: prepared
	};
}
async function activateEvent(eventId) {
	const db = getDb();
	const [draftEvent] = await db.select({ id: events.id }).from(events).where(and(eq(events.id, eventId), eq(events.status, "draft"))).limit(1);
	if (!draftEvent) throw new Error("Kỳ lễ nháp không tồn tại hoặc đã được kích hoạt");
	await db.batch([db.update(events).set({
		status: "archived",
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(events.status, "active")), db.update(events).set({
		status: "active",
		activatedAt: /* @__PURE__ */ new Date(),
		updatedAt: /* @__PURE__ */ new Date()
	}).where(and(eq(events.id, eventId), eq(events.status, "draft")))]);
}
//#endregion
//#region src/routes/admin/import/+page.server.ts
var load = ({ locals }) => {
	requireAdmin(locals);
};
var actions = {
	preview: async ({ locals, request }) => {
		requireAdmin(locals);
		const input = readImportForm(await request.formData());
		if (!input.eventName || !input.raw) return fail(400, {
			...input,
			error: "Nhập tên kỳ lễ và nội dung phân công trước khi xem trước."
		});
		return {
			...input,
			preview: toPreviewData(input.raw)
		};
	},
	import: async ({ locals, request }) => {
		requireAdmin(locals);
		const input = readImportForm(await request.formData());
		if (!input.eventName || !input.raw) return fail(400, {
			...input,
			error: "Nhập tên kỳ lễ và nội dung phân công trước khi import."
		});
		const preview = toPreviewData(input.raw);
		if (preview.errorCount > 0) return fail(400, {
			...input,
			preview,
			error: "Cần xử lý các dòng lỗi trước khi import."
		});
		try {
			const result = await createDraftEventFromImport(input);
			return {
				...input,
				preview,
				createdEvent: {
					id: result.eventId,
					name: input.eventName
				}
			};
		} catch (error) {
			return fail(400, {
				...input,
				preview,
				error: error instanceof Error ? error.message : "Không thể import dữ liệu lúc này."
			});
		}
	},
	activate: async ({ locals, request }) => {
		requireAdmin(locals);
		const eventId = String((await request.formData()).get("eventId") ?? "").trim();
		if (!eventId) return fail(400, { error: "Không tìm thấy kỳ lễ cần kích hoạt." });
		try {
			await activateEvent(eventId);
			return { activatedEventId: eventId };
		} catch {
			return fail(400, { error: "Không thể kích hoạt kỳ lễ lúc này." });
		}
	}
};
function readImportForm(formData) {
	return {
		eventName: String(formData.get("eventName") ?? "").trim(),
		raw: String(formData.get("raw") ?? "")
	};
}
function toPreviewData(raw) {
	const preview = previewImport(raw);
	return {
		assignmentCount: preview.parse.assignments.length,
		contactCount: preview.contactCount,
		departmentCount: preview.departmentCount,
		missingPhoneCount: preview.missingPhoneCount,
		duplicateAssignmentCount: preview.duplicateAssignmentCount,
		needsReviewCount: preview.needsReviewCount,
		errorCount: preview.parse.issues.filter((issue) => issue.severity === "error").length,
		issues: preview.parse.issues.slice(0, 50),
		sample: preview.parse.assignments.slice(0, 10)
	};
}
//#endregion
export { actions, load };
