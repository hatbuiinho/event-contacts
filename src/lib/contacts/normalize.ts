const missingPhonePattern =
	/^(?:chưa|chua)\s+(?:có|co)\s+(?:sđt|sdt|số điện thoại|so dien thoai)$/i;

export type NormalizedPhone = {
	digits: string;
	display: string;
};

export function normalizeText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'D')
		.toLocaleLowerCase('vi-VN')
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim()
		.replace(/\s+/g, ' ');
}

export type HighlightPart = { value: string; highlighted: boolean };

type NormalizedCharacter = { value: string; start: number; end: number };

function normalizeCharacterForMatch(value: string): string {
	const normalized = value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'D')
		.toLocaleLowerCase('vi-VN');

	return /^[\p{L}\p{N}]+$/u.test(normalized) ? normalized : ' ';
}

function escapeRegularExpression(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createNormalizedSearchPattern(query: string): RegExp | null {
	const tokens = normalizeText(query).split(' ').filter(Boolean);
	if (tokens.length === 0) return null;
	return new RegExp(tokens.map(escapeRegularExpression).join('.*'), 'i');
}

/**
 * Finds accent-insensitive query tokens, but returns slices of the original text.
 * For example, `duc` correctly returns a highlighted `Đức`.
 */
export function highlightNormalizedText(value: string, query: string): HighlightPart[] {
	const tokens = normalizeText(query).split(' ').filter(Boolean);
	if (tokens.length === 0) return [{ value, highlighted: false }];

	const characters: NormalizedCharacter[] = [];
	let offset = 0;
	for (const character of value) {
		const normalized = normalizeCharacterForMatch(character);
		for (const normalizedCharacter of normalized) {
			characters.push({
				value: normalizedCharacter,
				start: offset,
				end: offset + character.length
			});
		}
		offset += character.length;
	}

	const searchableValue = characters.map((character) => character.value).join('');
	const ranges: { start: number; end: number }[] = [];
	const pattern = createNormalizedSearchPattern(query);
	const match = pattern?.exec(searchableValue);
	if (!match) return [{ value, highlighted: false }];

	let position = match.index;
	for (const token of tokens) {
		position = searchableValue.indexOf(token, position);
		const first = characters[position];
		const last = characters[position + token.length - 1];
		if (first && last) ranges.push({ start: first.start, end: last.end });
		position += token.length;
	}

	if (ranges.length === 0) return [{ value, highlighted: false }];
	ranges.sort((a, b) => a.start - b.start || a.end - b.end);
	const mergedRanges = ranges.reduce<{ start: number; end: number }[]>((merged, range) => {
		const previous = merged.at(-1);
		if (previous && range.start <= previous.end) {
			previous.end = Math.max(previous.end, range.end);
		} else {
			merged.push({ ...range });
		}
		return merged;
	}, []);

	const parts: HighlightPart[] = [];
	let cursor = 0;
	for (const range of mergedRanges) {
		if (cursor < range.start)
			parts.push({ value: value.slice(cursor, range.start), highlighted: false });
		parts.push({ value: value.slice(range.start, range.end), highlighted: true });
		cursor = range.end;
	}
	if (cursor < value.length) parts.push({ value: value.slice(cursor), highlighted: false });
	return parts;
}

/** Highlights phone digits while preserving visual separators such as dots and spaces. */
export function highlightPhoneText(value: string, query: string): HighlightPart[] {
	const token = query.replace(/\D/g, '');
	if (!token) return [{ value, highlighted: false }];

	const digitPositions: number[] = [];
	let digits = '';
	for (let index = 0; index < value.length; index += 1) {
		if (/\d/.test(value[index])) {
			digits += value[index];
			digitPositions.push(index);
		}
	}

	const startDigit = digits.indexOf(token);
	if (startDigit === -1) return [{ value, highlighted: false }];
	const start = digitPositions[startDigit];
	const end = digitPositions[startDigit + token.length - 1] + 1;
	return [
		...(start > 0 ? [{ value: value.slice(0, start), highlighted: false }] : []),
		{ value: value.slice(start, end), highlighted: true },
		...(end < value.length ? [{ value: value.slice(end), highlighted: false }] : [])
	];
}

export function normalizePhone(value: string): NormalizedPhone | null {
	const source = value.trim();
	if (!source || missingPhonePattern.test(normalizeText(source))) return null;

	let digits = source.replace(/\D/g, '');
	if (digits.startsWith('84') && digits.length === 11) {
		digits = `0${digits.slice(2)}`;
	}
	if (!/^0\d{9}$/.test(digits)) {
		throw new Error('Số điện thoại cần gồm 10 chữ số và bắt đầu bằng 0');
	}

	return {
		digits,
		display: `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`
	};
}

export function splitTitle(displayName: string): { title: string | null; name: string } {
	const name = displayName.trim().replace(/\s+/g, ' ');
	const match = /^(Thầy|Chú|CS)\s+(.+)$/iu.exec(name);
	if (!match) return { title: null, name };

	return { title: match[1], name };
}
