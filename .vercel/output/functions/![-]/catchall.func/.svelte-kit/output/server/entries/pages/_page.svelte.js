import { i as head, n as derived, r as ensure_array_like, v as attr, y as escape_html } from "../../chunks/server.js";
import { n as normalizeText } from "../../chunks/normalize.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const initialData = data;
		let query = initialData.query;
		let departmentId = initialData.departmentId ?? "";
		let directory = {
			contacts: initialData.contacts,
			event: initialData.event
		};
		let isSearching = false;
		let requestId = 0;
		let profileMenuOpen = false;
		let editingContact = derived(() => directory.contacts.find((contact) => contact.id === data.editId) ?? null);
		function highlightedParts(value) {
			const tokens = query.trim().split(/\s+/).filter(Boolean);
			if (tokens.length === 0) return [{
				value,
				highlighted: false
			}];
			const expression = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
			return value.split(expression).filter(Boolean).map((part) => ({
				value: part,
				highlighted: tokens.some((token) => normalizeText(token) === normalizeText(part))
			}));
		}
		function escapeRegExp(value) {
			return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		async function search() {
			const parameters = new URLSearchParams();
			if (query.trim()) parameters.set("q", query.trim());
			if (departmentId) parameters.set("department", departmentId);
			const search = parameters.toString();
			const url = `/api/directory${search ? `?${search}` : ""}`;
			const currentRequest = ++requestId;
			isSearching = true;
			try {
				const response = await fetch(url);
				if (!response.ok) return;
				const result = await response.json();
				if (currentRequest !== requestId) return;
				directory = result;
				window.history.replaceState(window.history.state, "", search ? `/?${search}` : "/");
			} catch {} finally {
				if (currentRequest === requestId) isSearching = false;
			}
		}
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Danh bạ sự kiện</title>`);
			});
			$$renderer.push(`<meta name="description" content="Tra cứu nhanh liên hệ và phân ban trong kỳ lễ."/>`);
		});
		$$renderer.push(`<main class="mx-auto min-h-screen max-w-3xl px-4 pb-7 sm:px-6 sm:pb-10"><div class="sticky top-0 z-20 -mx-4 border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-bg)_94%,transparent)] px-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6 sm:pt-6"><header class="flex items-start justify-between gap-4 pb-4"><div class="flex min-w-0 items-center gap-3"><img alt="Logo kỳ lễ" class="size-12 shrink-0 rounded-xl border border-[var(--color-border)] bg-white object-cover"${attr("src", directory.event?.logoUrl ?? "/icons/icon.svg")}/> <div class="min-w-0"><p class="text-sm font-semibold tracking-wider text-[var(--color-primary)] uppercase">Danh bạ</p> <h1 class="mt-0.5 truncate text-xl font-bold tracking-tight sm:text-2xl">${escape_html(directory.event?.name ?? "Sự kiện")}</h1></div></div> `);
		if (data.user) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="relative shrink-0"><button${attr("aria-expanded", profileMenuOpen)} aria-haspopup="menu" aria-label="Mở menu tài khoản" class="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-1.5 pr-2 shadow-sm" type="button"><span class="grid size-8 place-items-center rounded-lg bg-[var(--color-primary)] text-white"><svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path></svg></span><span class="hidden max-w-28 text-left sm:block"><span class="block truncate text-xs font-semibold">${escape_html(data.user.displayName)}</span><span class="block text-[10px] text-[var(--color-text-muted)]">Tài khoản</span></span><svg aria-hidden="true" class="size-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></button> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a class="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]" href="/login?next=%2Fadmin">Đăng nhập</a>`);
		}
		$$renderer.push(`<!--]--></header> `);
		if (data.configured && directory.event) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="space-y-3 pb-4"><label class="block"><span class="sr-only">Tìm danh bạ</span> <input class="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 text-base shadow-sm ring-[var(--color-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2" name="q" placeholder="Nhập tên hoặc số điện thoại"${attr("value", query)}/></label> <label class="block"><span class="sr-only">Lọc theo tiểu ban</span> `);
			$$renderer.select({
				class: "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 ring-[var(--color-primary)] outline-none focus:ring-2",
				name: "department",
				onchange: search,
				value: departmentId
			}, ($$renderer) => {
				$$renderer.option({ value: "" }, ($$renderer) => {
					$$renderer.push(`Tất cả tiểu ban`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(data.departments);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let department = each_array[$$index];
					$$renderer.option({ value: department.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(department.name)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			});
			$$renderer.push(`</label></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (!data.configured) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h2 class="font-bold">Danh bạ chưa được kết nối</h2> <p class="mt-2 text-sm leading-6">Thêm <code>DATABASE_URL</code> của Neon vào <code>.env.local</code>, chạy migration, sau đó
				import và kích hoạt một kỳ lễ tại <a class="font-semibold underline" href="/admin/import">trang Import</a>.</p></section>`);
		} else if (data.databaseError) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<section class="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950"><h2 class="font-bold">Danh bạ tạm thời chưa kết nối được</h2> <p class="mt-2 text-sm leading-6">Vui lòng thử lại sau. Quản trị viên cần kiểm tra kết nối Neon trong Runtime Logs của Vercel.</p></section>`);
		} else if (!directory.event) {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<section class="mt-7 rounded-2xl border border-[var(--color-border)] bg-white p-5"><h2 class="font-bold">Chưa có kỳ lễ nào đang hoạt động</h2> <p class="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Tạo kỳ lễ nháp và kích hoạt nó tại trang Import để bắt đầu tra cứu danh bạ.</p></section>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p aria-live="polite" class="mb-4 text-sm text-[var(--color-text-muted)]">`);
			if (isSearching) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`Đang tìm…`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`${escape_html(directory.contacts.length)} người phù hợp`);
			}
			$$renderer.push(`<!--]--></p> `);
			if (directory.contacts.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<section class="rounded-2xl border border-[var(--color-border)] bg-white p-5 text-center"><p class="font-semibold">Không tìm thấy liên hệ phù hợp</p> <p class="mt-1 text-sm text-[var(--color-text-muted)]">Thử tìm không dấu hoặc nhập một phần số điện thoại.</p></section>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-3"><!--[-->`);
				const each_array_1 = ensure_array_like(directory.contacts);
				for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
					let contact = each_array_1[$$index_3];
					$$renderer.push(`<article class="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"><div class="flex items-start justify-between gap-4"><div><h2 class="text-lg font-bold"><!--[-->`);
					const each_array_2 = ensure_array_like(highlightedParts(contact.displayName));
					for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
						let part = each_array_2[$$index_1];
						if (part.highlighted) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<mark class="rounded bg-amber-200 px-0.5 text-inherit">${escape_html(part.value)}</mark>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`${escape_html(part.value)}`);
						}
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]--></h2> `);
					if (contact.phoneDisplay) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<a class="mt-1 inline-block font-medium text-[var(--color-primary)]"${attr("href", `tel:${contact.phoneDigits}`)}>${escape_html(contact.phoneDisplay)}</a>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<p class="mt-1 text-sm text-[var(--color-text-muted)]">Chưa có số điện thoại</p>`);
					}
					$$renderer.push(`<!--]--></div> <div class="flex shrink-0 gap-2">`);
					if (contact.phoneDisplay) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<a${attr("aria-label", `Gọi ${contact.displayName}`)} class="grid size-11 place-items-center rounded-xl bg-[var(--color-primary)] text-white"${attr("href", `tel:${contact.phoneDigits}`)}${attr("title", `Gọi ${contact.displayName}`)}><svg aria-hidden="true" class="size-5" fill="none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.64a2 2 0 0 1-.45 2.11L8.01 9.74a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.86.29 1.74.5 2.64.62A2 2 0 0 1 22 16.92Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg></a>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (data.isAdmin) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button${attr("aria-label", `Sửa ${contact.displayName}`)} class="grid size-10 place-items-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-primary)]"${attr("title", `Sửa ${contact.displayName}`)} type="button"><svg aria-hidden="true" class="size-5" fill="none" viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3ZM14.5 7.5l3 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg></button>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<a${attr("aria-label", `Đăng nhập để sửa ${contact.displayName}`)} class="grid size-10 place-items-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-primary)]"${attr("href", `/login?next=${encodeURIComponent(`/?edit=${contact.id}`)}`)} title="Đăng nhập để sửa"><svg aria-hidden="true" class="size-5" fill="none" viewBox="0 0 24 24"><rect height="11" rx="2" width="14" x="5" y="10" stroke="currentColor" stroke-width="1.8"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path></svg></a>`);
					}
					$$renderer.push(`<!--]--></div></div> <ul class="mt-4 space-y-1.5"><!--[-->`);
					const each_array_3 = ensure_array_like(contact.departments);
					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let department = each_array_3[$$index_2];
						$$renderer.push(`<li class="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-2 text-sm"><span class="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)] text-white shadow-sm"><svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 17l9 5 9-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg></span><span><span class="font-semibold">${escape_html(department.name)}</span>${escape_html(department.role ? ` · ${department.role}` : "")}${escape_html(department.isSupport ? " · Hỗ trợ" : "")}</span></li>`);
					}
					$$renderer.push(`<!--]--></ul></article>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></main> `);
		if (editingContact() && data.isAdmin) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div aria-modal="true" class="fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 sm:place-items-center sm:p-6" role="dialog" aria-label="Sửa liên hệ"><div class="w-full rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl"><div class="flex items-center justify-between gap-4"><h2 class="text-xl font-bold">Sửa liên hệ</h2> <button aria-label="Đóng" class="rounded-lg px-3 py-2 text-lg" type="button">×</button></div> <form class="mt-4 space-y-4" method="POST"><input name="id" type="hidden"${attr("value", editingContact().id)}/> <label class="block"><span class="mb-1 block text-sm font-semibold">Họ và tên</span><input class="w-full rounded-xl border border-[var(--color-border)] px-3 py-3" name="displayName"${attr("value", editingContact().displayName)} required=""/></label> <label class="block"><span class="mb-1 block text-sm font-semibold">Số điện thoại</span><input class="w-full rounded-xl border border-[var(--color-border)] px-3 py-3" name="phone"${attr("value", editingContact().phoneDisplay ?? "")} inputmode="tel"/></label> <button class="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 font-semibold text-white" formaction="?/updateContact" type="submit">Lưu thay đổi</button></form></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
