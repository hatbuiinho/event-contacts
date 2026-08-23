import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createNormalizedSearchPattern,
	highlightNormalizedText,
	highlightPhoneText,
	normalizeText
} from './normalize.ts';

test('highlights Vietnamese names with an unaccented query', () => {
	assert.deepEqual(highlightNormalizedText('Nguyễn Văn Đức', 'duc'), [
		{ value: 'Nguyễn Văn ', highlighted: false },
		{ value: 'Đức', highlighted: true }
	]);
});

test('highlights each normalized token in the original display value', () => {
	assert.deepEqual(highlightNormalizedText('Nguyễn Văn Đức', 'nguyen duc'), [
		{ value: 'Nguyễn', highlighted: true },
		{ value: ' Văn ', highlighted: false },
		{ value: 'Đức', highlighted: true }
	]);
});

test('highlights phone digits while keeping the visual separators', () => {
	assert.deepEqual(highlightPhoneText('0901.234.567', '0901234'), [
		{ value: '0901.234', highlighted: true },
		{ value: '.567', highlighted: false }
	]);
});

test('matches spaced tokens as a safe sequential search pattern', () => {
	const pattern = createNormalizedSearchPattern('d p x');
	assert.ok(pattern?.test(normalizeText('Điều phối xe')));
	assert.deepEqual(highlightNormalizedText('Điều phối xe', 'd p x'), [
		{ value: 'Đ', highlighted: true },
		{ value: 'iều ', highlighted: false },
		{ value: 'p', highlighted: true },
		{ value: 'hối ', highlighted: false },
		{ value: 'x', highlighted: true },
		{ value: 'e', highlighted: false }
	]);
});
