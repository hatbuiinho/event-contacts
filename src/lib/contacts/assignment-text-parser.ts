import { normalizePhone, normalizeText, splitTitle } from './normalize.ts';

export type ParsedAssignment = {
	sourceLine: number;
	departmentName: string;
	departmentNormalizedName: string;
	displayName: string;
	normalizedName: string;
	title: string | null;
	phoneDisplay: string | null;
	phoneDigits: string | null;
	role: string;
	isSupport: boolean;
};

export type ImportParseIssue = {
	line: number;
	message: string;
	severity: 'warning' | 'error';
};

export type AssignmentParseResult = {
	assignments: ParsedAssignment[];
	issues: ImportParseIssue[];
};

export function parseAssignmentText(raw: string): AssignmentParseResult {
	const assignments: ParsedAssignment[] = [];
	const issues: ImportParseIssue[] = [];
	let departmentName = '';
	let role = '';

	for (const [index, originalLine] of raw.replace(/\r\n?/g, '\n').split('\n').entries()) {
		const lineNumber = index + 1;
		const line = originalLine.trim();
		if (!line) continue;
		if (/^PHÂN CÔNG\b/iu.test(line)) continue;

		const department = parseDepartmentHeading(line);
		if (department) {
			departmentName = department;
			role = '';
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

		if (looksLikeUnassignedPerson(line)) {
			issues.push({
				line: lineNumber,
				severity: 'warning',
				message: 'Không nhận diện được người hoặc số điện thoại ở dòng này'
			});
		}
	}

	return { assignments, issues };
}

function parseDepartmentHeading(line: string): string | null {
	const withoutNumber = line.replace(/^\d+\.\s*/, '');
	if (/^(?:TIỂU BAN|BAN)\b/iu.test(withoutNumber)) return withoutNumber;

	const isUpperCaseHeading =
		withoutNumber.length >= 8 &&
		/[\p{L}]/u.test(withoutNumber) &&
		withoutNumber === withoutNumber.toLocaleUpperCase('vi-VN') &&
		!/^(?:PHÂN CÔNG|NHÂN SỰ LỄ)/iu.test(withoutNumber);

	return isUpperCaseHeading ? withoutNumber : null;
}

function parseRoleHeading(line: string): string | null {
	const value = line.replace(/^[-+•]\s*/, '').trim();
	if (!value.endsWith(':')) return null;

	const role = value.slice(0, -1).trim();
	return role || null;
}

function parsePersonLine(
	line: string,
	lineNumber: number,
	departmentName: string,
	contextRole: string,
	issues: ImportParseIssue[]
): ParsedAssignment | null {
	const value = line.replace(/^[-+•]\s*/, '').trim();
	const separator = /\s+[–—-]\s+/.exec(value);
	if (!separator || separator.index === undefined) return null;

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
			severity: 'error',
			message: 'Người này chưa thuộc tiểu ban nào'
		});
		return null;
	}

	const isSupport = /\(\s*hỗ trợ\s*\)/iu.test(beforePhone);
	const displayName = beforePhone.replace(/\s*\(\s*hỗ trợ\s*\)/giu, '').trim();
	if (!displayName) {
		issues.push({ line: lineNumber, severity: 'error', message: 'Tên người không được để trống' });
		return null;
	}

	let phoneDisplay: string | null = null;
	let phoneDigits: string | null = null;
	try {
		const phone = normalizePhone(phoneSource);
		phoneDisplay = phone?.display ?? null;
		phoneDigits = phone?.digits ?? null;
	} catch (error) {
		issues.push({
			line: lineNumber,
			severity: 'error',
			message: error instanceof Error ? error.message : 'Số điện thoại không hợp lệ'
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

function looksLikeUnassignedPerson(line: string): boolean {
	return /^[-+•]\s*(?:Thầy|Chú|CS)\b/iu.test(line) || /chưa có sđt/iu.test(line);
}
