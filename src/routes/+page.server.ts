import { and, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

import { normalizePhone, normalizeText } from '$lib/contacts/normalize';
import { requireAdmin } from '$lib/server/auth/guard';
import { isDatabaseConfigured, getDb } from '$lib/server/db/client';
import { getActiveDirectory } from '$lib/server/contacts/directory-service';
import { contacts, events } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const query = url.searchParams.get('q')?.trim() ?? '';
	const departmentId = url.searchParams.get('department')?.trim() || null;
	const editId =
		locals.user?.role === 'admin' ? url.searchParams.get('edit')?.trim() || null : null;
	if (!isDatabaseConfigured()) {
		return {
			configured: false,
			databaseError: false,
			isAdmin: false,
			user: null,
			editId: null,
			query,
			departmentId,
			directory: null
		};
	}

	return {
		configured: true,
		databaseError: false,
		isAdmin: locals.user?.role === 'admin',
		user: locals.user
			? { displayName: locals.user.displayName, username: locals.user.username }
			: null,
		editId,
		query,
		departmentId,
		// Stream this response so the application shell can render before a cold
		// Neon query completes. The client then keeps searching locally as before.
		directory: getActiveDirectory({ query: '', departmentId: null })
			.then((directory) => ({ ...directory, databaseError: false }))
			.catch((error) => {
				console.error('[directory] database connection failed', error);
				return { event: null, contacts: [], departments: [], databaseError: true };
			})
	};
};

export const actions = {
	updateContact: async ({ locals, request }) => {
		requireAdmin(locals, '/');
		const form = await request.formData();
		const id = String(form.get('id') ?? '').trim();
		const displayName = String(form.get('displayName') ?? '').trim();
		if (!id || !displayName) return fail(400, { error: 'Nhập tên liên hệ.' });

		try {
			const phone = normalizePhone(String(form.get('phone') ?? ''));
			const [activeEvent] = await getDb()
				.select({ id: events.id })
				.from(events)
				.where(eq(events.status, 'active'))
				.limit(1);
			if (!activeEvent) return fail(404, { error: 'Không có đại lễ đang hoạt động.' });
			await getDb()
				.update(contacts)
				.set({
					displayName,
					normalizedName: normalizeText(displayName),
					phoneDisplay: phone?.display ?? null,
					phoneDigits: phone?.digits ?? null,
					updatedAt: new Date()
				})
				.where(and(eq(contacts.id, id), eq(contacts.eventId, activeEvent.id)));
			return { success: 'Đã cập nhật liên hệ.' };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Không thể cập nhật liên hệ.'
			});
		}
	}
} satisfies Actions;
