import { json } from '@sveltejs/kit';
import { getActiveDirectory } from '$lib/server/contacts/directory-service';
import { isDatabaseConfigured } from '$lib/server/db/client';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim() ?? '';
	const departmentId = url.searchParams.get('department')?.trim() || null;

	if (!isDatabaseConfigured()) {
		return json({ event: null, contacts: [] });
	}

	try {
		return json(await getActiveDirectory({ query, departmentId }));
	} catch (error) {
		console.error('[directory-api] database connection failed', error);
		return json({ error: 'Không thể kết nối cơ sở dữ liệu.' }, { status: 503 });
	}
};
