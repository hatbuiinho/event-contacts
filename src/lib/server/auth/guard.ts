import { redirect } from '@sveltejs/kit';

export function requireAdmin(
	locals: App.Locals,
	next = '/admin/import'
): NonNullable<App.Locals['user']> {
	if (locals.user?.role !== 'admin') {
		throw redirect(303, `/login?next=${encodeURIComponent(next)}`);
	}
	return locals.user;
}
