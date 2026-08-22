import { a as sessionCookieName, n as createSession, o as sessionMaxAgeSeconds, r as deleteSession, t as authenticate } from "../../../chunks/auth-service.js";
import { fail, redirect } from "@sveltejs/kit";
//#region src/routes/login/+page.server.ts
var load = ({ locals, url }) => {
	if (locals.user) throw redirect(303, safeNext(url.searchParams.get("next")));
	return { next: safeNext(url.searchParams.get("next")) };
};
var actions = {
	login: async ({ cookies, request, url }) => {
		const formData = await request.formData();
		const username = String(formData.get("username") ?? "");
		const password = String(formData.get("password") ?? "");
		const next = safeNext(String(formData.get("next") ?? ""));
		if (!username.trim() || !password) return fail(400, {
			username,
			next,
			error: "Nhập tên đăng nhập và mật khẩu."
		});
		try {
			const user = await authenticate(username, password);
			if (!user) return fail(400, {
				username,
				next,
				error: "Tên đăng nhập hoặc mật khẩu không đúng."
			});
			const token = await createSession(user.id);
			cookies.set(sessionCookieName, token, {
				path: "/",
				httpOnly: true,
				sameSite: "lax",
				secure: url.protocol === "https:",
				maxAge: sessionMaxAgeSeconds
			});
		} catch (error) {
			console.error("[auth] login failed", error);
			return fail(400, {
				username,
				next,
				error: "Chưa thể đăng nhập. Kiểm tra cấu hình database và tài khoản quản trị."
			});
		}
		throw redirect(303, next);
	},
	logout: async ({ cookies }) => {
		const token = cookies.get(sessionCookieName);
		if (token) try {
			await deleteSession(token);
		} catch {}
		cookies.delete(sessionCookieName, { path: "/" });
		throw redirect(303, "/");
	}
};
function safeNext(value) {
	return value?.startsWith("/") && !value.startsWith("//") ? value : "/admin/import";
}
//#endregion
export { actions, load };
