import { i as head, n as derived, r as ensure_array_like, t as attr_class, v as attr, y as escape_html } from "../../../chunks/server.js";
import { n as normalizeText } from "../../../chunks/normalize.js";
//#region src/routes/admin/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let contactQuery = "";
		let profileMenuOpen = false;
		let selectedContactId = null;
		let selectedContact = derived(() => data.contacts.find((contact) => contact.id === selectedContactId) ?? null);
		let isContactDetail = derived(() => selectedContact() !== null);
		let filteredContacts = derived(() => {
			const query = normalizeText(contactQuery);
			const digits = contactQuery.replace(/\D/g, "");
			if (!query && !digits) return data.contacts;
			return data.contacts.filter((contact) => normalizeText(`${contact.displayName} ${contact.title ?? ""}`).includes(query) || digits.length > 0 && (contact.phoneDisplay ?? "").replace(/\D/g, "").includes(digits));
		});
		head("1jef3w8", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Quản trị danh bạ</title>`);
			});
			$$renderer.push(`<meta name="description" content="Quản lý liên hệ, tiểu ban và kỳ lễ."/>`);
		});
		$$renderer.push(`<main class="mx-auto min-h-screen max-w-6xl px-4 pb-28 sm:px-6 lg:pb-10"><header class="admin-topbar sticky top-0 z-30 -mx-4 mb-6 border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-bg)_96%,transparent)] px-4 pt-3 backdrop-blur sm:-mx-6 sm:px-6"><div class="flex min-h-14 items-center justify-between gap-3">`);
		if (isContactDetail()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button aria-label="Quay lại danh sách liên hệ" class="topbar-back svelte-1jef3w8" type="button">←</button> <div class="min-w-0 flex-1"><p class="text-xs font-semibold tracking-wider text-[var(--color-primary)] uppercase">Liên hệ</p> <h1 class="truncate text-lg font-bold">${escape_html(selectedContact()?.displayName)}</h1></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a aria-label="Về danh bạ" class="topbar-back svelte-1jef3w8" href="/">←</a> <div class="min-w-0 flex-1"><p class="text-xs font-semibold tracking-wider text-[var(--color-primary)] uppercase">Quản trị</p> <h1 class="truncate text-lg font-bold">${escape_html(data.event?.name ?? "Danh bạ")}</h1></div>`);
		}
		$$renderer.push(`<!--]--> <div class="relative flex shrink-0 items-center gap-2"><button${attr("aria-expanded", profileMenuOpen)} aria-haspopup="menu" aria-label="Mở menu tài khoản" class="profile-trigger svelte-1jef3w8" type="button"><span class="profile-avatar svelte-1jef3w8"><svg aria-hidden="true" viewBox="0 0 24 24" class="svelte-1jef3w8"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"></path></svg></span><span class="profile-name svelte-1jef3w8"><strong class="svelte-1jef3w8">${escape_html(data.user.displayName)}</strong><small class="svelte-1jef3w8">Tài khoản</small></span><svg class="profile-chevron svelte-1jef3w8" aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"></path></svg></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> `);
		if (data.event) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<nav aria-label="Khu vực quản trị" class="mt-2 hidden gap-1 overflow-x-auto rounded-t-xl border-x border-t border-[var(--color-border)] bg-white p-1 lg:flex"><button${attr_class("tab svelte-1jef3w8", void 0, { "tab-active": true })}>Liên hệ <span class="svelte-1jef3w8">${escape_html(data.contacts.length)}</span></button> <button${attr_class("tab svelte-1jef3w8", void 0, { "tab-active": false })}>Tiểu ban <span class="svelte-1jef3w8">${escape_html(data.departments.length)}</span></button> <button${attr_class("tab svelte-1jef3w8", void 0, { "tab-active": false })}>Đại lễ</button></nav>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></header> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="notice notice-error svelte-1jef3w8" role="alert">${escape_html(form.error)}</p>`);
		} else if (form?.success) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="notice notice-success svelte-1jef3w8">${escape_html(form.success)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (!data.event) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="panel p-6 svelte-1jef3w8"><h2 class="text-xl font-bold">Chưa có kỳ lễ đang hoạt động</h2> <p class="mt-2 text-[var(--color-text-muted)]">Hãy import và kích hoạt một kỳ lễ trước.</p></section>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section${attr_class("contacts-workspace grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)] svelte-1jef3w8", void 0, { "showing-detail": selectedContact() !== null })}><div class="contact-list panel overflow-hidden svelte-1jef3w8"><div class="border-b border-[var(--color-border)] p-4"><div class="flex items-center justify-between gap-3"><div><h2 class="font-bold">Liên hệ</h2> <p class="text-sm text-[var(--color-text-muted)]">Tìm và chọn để chỉnh sửa</p></div> <button class="button-primary svelte-1jef3w8">+ Thêm</button></div> <input class="field mt-4 svelte-1jef3w8"${attr("value", contactQuery)} placeholder="Tìm theo tên hoặc số điện thoại" type="search"/></div> <div class="max-h-[65vh] overflow-y-auto p-2">`);
			if (filteredContacts().length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="p-4 text-center text-sm text-[var(--color-text-muted)]">Không có liên hệ phù hợp.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(filteredContacts());
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let contact = each_array[$$index];
					$$renderer.push(`<button${attr_class("contact-row svelte-1jef3w8", void 0, { "selected": contact.id === selectedContactId })}><span class="min-w-0 text-left"><strong class="block truncate">${escape_html(contact.displayName)}</strong><span class="block truncate text-sm text-[var(--color-text-muted)]">${escape_html(contact.phoneDisplay ?? "Chưa có số điện thoại")}</span></span><span class="shrink-0 text-xs text-[var(--color-text-muted)]">${escape_html(contact.memberships.length)} ban</span></button>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="contact-editor panel p-5 svelte-1jef3w8">`);
			if (selectedContact()) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="flex items-center justify-between gap-3"><div><p class="mt-3 text-sm text-[var(--color-text-muted)]">Chỉnh sửa liên hệ</p> <h2 class="text-lg font-bold">${escape_html(selectedContact().displayName)}</h2></div> <button class="button-danger svelte-1jef3w8" form="delete-contact" type="submit">Xóa</button></div> <form class="mt-4 space-y-3" method="POST"><input name="id" type="hidden"${attr("value", selectedContact().id)}/><label><span class="label svelte-1jef3w8">Họ và tên *</span><input class="field svelte-1jef3w8" name="displayName"${attr("value", selectedContact().displayName)} required=""/></label><label><span class="label svelte-1jef3w8">Số điện thoại</span><input class="field svelte-1jef3w8" name="phone"${attr("value", selectedContact().phoneDisplay ?? "")} inputmode="tel"/></label><label><span class="label svelte-1jef3w8">Chức danh / danh xưng</span><input class="field svelte-1jef3w8" name="title"${attr("value", selectedContact().title ?? "")}/></label><label><span class="label svelte-1jef3w8">Ghi chú</span><textarea class="field svelte-1jef3w8" name="notes">`);
				const $$body = escape_html(selectedContact().notes ?? "");
				if ($$body) $$renderer.push(`${$$body}`);
				$$renderer.push(`</textarea></label><button class="button-primary svelte-1jef3w8" formaction="?/updateContact" type="submit">Lưu thay đổi</button></form> <form id="delete-contact" method="POST"><input name="id" type="hidden"${attr("value", selectedContact().id)}/><button formaction="?/deleteContact" type="submit" class="hidden">Xóa</button></form> <div class="mt-6 border-t border-[var(--color-border)] pt-5"><h3 class="font-bold">Phân công (${escape_html(selectedContact().memberships.length)})</h3> <div class="mt-3 flex flex-wrap gap-2"><!--[-->`);
				const each_array_2 = ensure_array_like(selectedContact().memberships);
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let membership = each_array_2[$$index_2];
					$$renderer.push(`<form method="POST"><input name="id" type="hidden"${attr("value", membership.id)}/><button class="tag svelte-1jef3w8" formaction="?/deleteMembership" type="submit">${escape_html(membership.departmentName)}${escape_html(membership.role ? ` · ${membership.role}` : "")}${escape_html(membership.isSupport ? " · Hỗ trợ" : "")} ×</button></form>`);
				}
				$$renderer.push(`<!--]--></div> <form class="mt-4 grid gap-2 sm:grid-cols-2" method="POST"><input name="contactId" type="hidden"${attr("value", selectedContact().id)}/><select class="field svelte-1jef3w8" name="departmentId" required="">`);
				$$renderer.option({ value: "" }, ($$renderer) => {
					$$renderer.push(`Thêm vào tiểu ban…`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_3 = ensure_array_like(data.departments);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let department = each_array_3[$$index_3];
					$$renderer.option({ value: department.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(department.name)}`);
					});
				}
				$$renderer.push(`<!--]--></select><input class="field svelte-1jef3w8" name="role" placeholder="Vai trò (không bắt buộc)"/><label class="flex items-center gap-2 text-sm"><input name="isSupport" type="checkbox"/> Hỗ trợ</label><button class="button-secondary sm:col-span-2 svelte-1jef3w8" formaction="?/createMembership" type="submit">Thêm phân công</button></form></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="flex min-h-64 items-center justify-center text-center text-[var(--color-text-muted)]">Chọn một liên hệ bên trái để chỉnh sửa,<br/>hoặc thêm liên hệ mới.</div>`);
			}
			$$renderer.push(`<!--]--></div></section>`);
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></main> `);
		if (data.event && !isContactDetail()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<nav aria-label="Điều hướng quản trị" class="admin-bottom-bar lg:hidden svelte-1jef3w8"><button${attr_class("bottom-item svelte-1jef3w8", void 0, { "bottom-active": true })}><svg aria-hidden="true" viewBox="0 0 24 24" class="svelte-1jef3w8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Liên hệ</button> <button${attr_class("bottom-item svelte-1jef3w8", void 0, { "bottom-active": false })}><svg aria-hidden="true" viewBox="0 0 24 24" class="svelte-1jef3w8"><path d="M4 21V10m8 11V3m8 18v-7M2 10h4M10 3h4m4 11h4"></path></svg>Tiểu ban</button> <button${attr_class("bottom-item svelte-1jef3w8", void 0, { "bottom-active": false })}><svg aria-hidden="true" viewBox="0 0 24 24" class="svelte-1jef3w8"><path d="M12 3 4 7v5c0 5 3.4 8.74 8 10 4.6-1.26 8-5 8-10V7l-8-4Zm0 5v8m-4-4h8"></path></svg>Đại lễ</button></nav>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
