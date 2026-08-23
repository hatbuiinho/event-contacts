import {
	parseAssignmentText,
	type AssignmentParseResult,
	type ParsedAssignment
} from './assignment-text-parser.ts';

export type PreparedContact = {
	id: string;
	displayName: string;
	normalizedName: string;
	title: string | null;
	phoneDisplay: string | null;
	phoneDigits: string | null;
};

export type PreparedDepartment = {
	id: string;
	name: string;
	normalizedName: string;
	sortOrder: number;
};

export type PreparedMembership = {
	id: string;
	contactId: string;
	departmentId: string;
	role: string;
	isSupport: boolean;
	sortOrder: number;
};

export type ImportPreview = {
	parse: AssignmentParseResult;
	contactCount: number;
	departmentCount: number;
	missingPhoneCount: number;
	duplicateAssignmentCount: number;
	needsReviewCount: number;
};

export type PreparedImport = ImportPreview & {
	contacts: PreparedContact[];
	departments: PreparedDepartment[];
	memberships: PreparedMembership[];
};

export function prepareAssignmentImport(raw: string): PreparedImport {
	const parse = parseAssignmentText(raw);
	const contactsByKey = new Map<string, PreparedContact>();
	const departmentsByName = new Map<string, PreparedDepartment>();
	const membershipsByKey = new Map<string, PreparedMembership>();
	const membershipCountByDepartment = new Map<string, number>();
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
		if (!membershipsByKey.has(membershipKey)) {
			const sortOrder = membershipCountByDepartment.get(department.id) ?? 0;
			membershipsByKey.set(membershipKey, {
				id: crypto.randomUUID(),
				contactId: contact.id,
				departmentId: department.id,
				role: assignment.role,
				isSupport: assignment.isSupport,
				sortOrder
			});
			membershipCountByDepartment.set(department.id, sortOrder + 1);
		}
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

function ensureContact(
	assignment: ParsedAssignment,
	contactsByKey: Map<string, PreparedContact>
): PreparedContact {
	const key = assignment.phoneDigits
		? `phone:${assignment.phoneDigits}`
		: `name:${assignment.normalizedName}`;
	const existing = contactsByKey.get(key);
	if (existing) return existing;

	const contact: PreparedContact = {
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

function ensureDepartment(
	assignment: ParsedAssignment,
	departmentsByName: Map<string, PreparedDepartment>
): PreparedDepartment {
	const existing = departmentsByName.get(assignment.departmentNormalizedName);
	if (existing) return existing;

	const department: PreparedDepartment = {
		id: crypto.randomUUID(),
		name: assignment.departmentName,
		normalizedName: assignment.departmentNormalizedName,
		sortOrder: departmentsByName.size
	};
	departmentsByName.set(assignment.departmentNormalizedName, department);
	return department;
}
