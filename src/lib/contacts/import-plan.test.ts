import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareAssignmentImport } from './import-plan.ts';

test('groups one contact into multiple departments while preserving assignments', () => {
	const prepared = prepareAssignmentImport(`
1. TIỂU BAN MÔI TRƯỜNG
+ Thầy Pháp Điền – 0971.286.209
2. TIỂU BAN NƯỚC SINH HOẠT
+ Thầy Pháp Điền – 0971.286.209
+ Chú Pháp Tĩnh – Chưa có SĐT
`);

	assert.equal(prepared.parse.issues.length, 0);
	assert.equal(prepared.contactCount, 2);
	assert.equal(prepared.departmentCount, 2);
	assert.equal(prepared.memberships.length, 3);
	assert.equal(prepared.missingPhoneCount, 1);
	assert.equal(prepared.needsReviewCount, 1);
	assert.equal(prepared.duplicateAssignmentCount, 0);
});

test('turns imported role headings into reusable department groups', () => {
	const prepared = prepareAssignmentImport(`
1. TIỂU BAN ĐIỀU PHỐI
- Điều phối chung:
+ Chú Pháp Chân – 0367.827.680
+ Cô An – 0900.000.001
`);

	assert.equal(prepared.groups.length, 1);
	assert.equal(prepared.groups[0]?.name, 'Điều phối chung');
	assert.equal(prepared.memberships.every((membership) => membership.groupId === prepared.groups[0]?.id), true);
});
