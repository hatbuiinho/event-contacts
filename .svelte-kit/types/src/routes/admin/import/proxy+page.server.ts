// @ts-nocheck
import { fail } from '@sveltejs/kit';

import {
	activateEvent,
	createDraftEventFromImport,
	previewImport
} from '$lib/server/contacts/import-service';
import { requireAdmin } from '$lib/server/auth/guard';

import type { Actions, PageServerLoad } from './$types';

export const load = ({ locals }: Parameters<PageServerLoad>[0]) => {
	requireAdmin(locals);
};

export const actions = {
	preview: async ({ locals, request }) => {
		requireAdmin(locals);
		const input = readImportForm(await request.formData());
		if (!input.eventName || !input.raw) {
			return fail(400, {
				...input,
				error: 'Nhập tên kỳ lễ và nội dung phân công trước khi xem trước.'
			});
		}

		return { ...input, preview: toPreviewData(input.raw) };
	},
	import: async ({ locals, request }) => {
		requireAdmin(locals);
		const input = readImportForm(await request.formData());
		if (!input.eventName || !input.raw) {
			return fail(400, {
				...input,
				error: 'Nhập tên kỳ lễ và nội dung phân công trước khi import.'
			});
		}

		const preview = toPreviewData(input.raw);
		if (preview.errorCount > 0) {
			return fail(400, { ...input, preview, error: 'Cần xử lý các dòng lỗi trước khi import.' });
		}

		try {
			const result = await createDraftEventFromImport(input);
			return {
				...input,
				preview,
				createdEvent: { id: result.eventId, name: input.eventName }
			};
		} catch (error) {
			return fail(400, {
				...input,
				preview,
				error: error instanceof Error ? error.message : 'Không thể import dữ liệu lúc này.'
			});
		}
	},
	activate: async ({ locals, request }) => {
		requireAdmin(locals);
		const eventId = String((await request.formData()).get('eventId') ?? '').trim();
		if (!eventId) return fail(400, { error: 'Không tìm thấy kỳ lễ cần kích hoạt.' });

		try {
			await activateEvent(eventId);
			return { activatedEventId: eventId };
		} catch {
			return fail(400, { error: 'Không thể kích hoạt kỳ lễ lúc này.' });
		}
	}
} satisfies Actions;

function readImportForm(formData: FormData) {
	return {
		eventName: String(formData.get('eventName') ?? '').trim(),
		raw: String(formData.get('raw') ?? '')
	};
}

function toPreviewData(raw: string) {
	const preview = previewImport(raw);
	return {
		assignmentCount: preview.parse.assignments.length,
		contactCount: preview.contactCount,
		departmentCount: preview.departmentCount,
		missingPhoneCount: preview.missingPhoneCount,
		duplicateAssignmentCount: preview.duplicateAssignmentCount,
		needsReviewCount: preview.needsReviewCount,
		errorCount: preview.parse.issues.filter((issue) => issue.severity === 'error').length,
		issues: preview.parse.issues.slice(0, 50),
		sample: preview.parse.assignments.slice(0, 10)
	};
}
