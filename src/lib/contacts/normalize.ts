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
