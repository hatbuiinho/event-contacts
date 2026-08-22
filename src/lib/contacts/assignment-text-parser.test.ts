import assert from 'node:assert/strict';
import test from 'node:test';

import { parseAssignmentText } from './assignment-text-parser.ts';
import { normalizePhone, normalizeText } from './normalize.ts';

test('normalizes Vietnamese text and phone numbers', () => {
	assert.equal(normalizeText('  Thầy  Pháp Điền  '), 'thay phap dien');
	assert.deepEqual(normalizePhone('+84 971.286.209'), {
		digits: '0971286209',
		display: '0971.286.209'
	});
	assert.equal(normalizePhone('Chưa có SĐT'), null);
});

test('parses memberships, repeated contacts and missing phone numbers', () => {
	const result = parseAssignmentText(`
1. TIỂU BAN MÔI TRƯỜNG
  + Thầy Pháp Điền – 0971.286.209
  + CS Thể Lý Cần (Hỗ trợ) – 0968.625.603
2. TIỂU BAN NƯỚC SINH HOẠT
  + Thầy Pháp Điền – 0971.286.209
  + Chú Pháp Tĩnh – Chưa có SĐT
`);

	assert.equal(result.issues.length, 0);
	assert.equal(result.assignments.length, 4);
	assert.deepEqual(
		result.assignments.filter((assignment) => assignment.phoneDigits === '0971286209'),
		[
			expectAssignment('TIỂU BAN MÔI TRƯỜNG', 'Thầy Pháp Điền'),
			expectAssignment('TIỂU BAN NƯỚC SINH HOẠT', 'Thầy Pháp Điền')
		]
	);
	assert.equal(result.assignments[1].isSupport, true);
	assert.equal(result.assignments[3].phoneDigits, null);
});

test('preserves role headings and parses inline roles', () => {
	const result = parseAssignmentText(`
TIỂU BAN THỊ GIẢ
- Thị giả Sư Phụ:
  + Thầy Toàn Như – 0983.386.618
- Thị giả Chư Tăng : Thầy Pháp Thông – 0966.699.327
- MC, thông báo - Quý Thầy:
  + Thầy Toàn Khai – 0868.983.869
`);

	assert.equal(result.issues.length, 0);
	assert.equal(result.assignments[0].role, 'Thị giả Sư Phụ');
	assert.equal(result.assignments[1].role, 'Thị giả Chư Tăng');
	assert.equal(result.assignments[2].role, 'MC, thông báo - Quý Thầy');
});

function expectAssignment(departmentName: string, displayName: string) {
	return {
		sourceLine: departmentName === 'TIỂU BAN MÔI TRƯỜNG' ? 3 : 6,
		departmentName,
		departmentNormalizedName: normalizeText(departmentName),
		displayName,
		normalizedName: normalizeText(displayName),
		title: 'Thầy',
		phoneDisplay: '0971.286.209',
		phoneDigits: '0971286209',
		role: '',
		isSupport: false
	};
}
