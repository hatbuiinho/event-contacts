import { i as head, r as ensure_array_like, v as attr, y as escape_html } from "../../../../chunks/server.js";
//#region src/routes/admin/import/+page.svelte
function Stat($$renderer, label, value) {
	$$renderer.push(`<div class="rounded-xl border border-[var(--color-border)] bg-white p-4"><div class="text-sm text-[var(--color-text-muted)]">${escape_html(label)}</div> <div class="mt-1 text-2xl font-bold">${escape_html(value)}</div></div>`);
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		head("vp2p5y", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Import danh bạ</title>`);
			});
			$$renderer.push(`<meta name="description" content="Xem trước và import danh bạ cho kỳ lễ mới."/>`);
		});
		$$renderer.push(`<main class="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:py-12"><header class="mb-8"><a class="text-sm font-medium text-[var(--color-primary)]" href="/">← Về trang chủ</a> <h1 class="mt-4 text-3xl font-bold tracking-tight">Import danh bạ</h1> <p class="mt-2 max-w-2xl text-[var(--color-text-muted)]">Dán nội dung phân công như file <code>data.md</code>. Hệ thống tạo kỳ lễ ở trạng thái <em>nháp</em>; dữ liệu hiện tại chỉ thay đổi sau khi bạn kích hoạt.</p></header> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">${escape_html(form.error)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.activatedEventId) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">Đã kích hoạt kỳ lễ. Danh bạ tra cứu sẽ dùng bộ dữ liệu này.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST" class="space-y-6"><label class="block"><span class="mb-2 block font-semibold">Tên kỳ lễ</span> <input class="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 ring-[var(--color-primary)] outline-none focus:ring-2" name="eventName" placeholder="Lễ Vu Lan 2026"${attr("value", form?.eventName ?? "")}/></label> <label class="block"><span class="mb-2 block font-semibold">Nội dung phân công</span> <textarea class="min-h-96 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 font-mono text-sm leading-6 ring-[var(--color-primary)] outline-none focus:ring-2" name="raw" placeholder="Dán nội dung phân công vào đây">`);
		const $$body = escape_html(form?.raw ?? "");
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea></label> <div class="flex flex-wrap gap-3"><button class="rounded-xl bg-white px-4 py-3 font-semibold text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]" formaction="?/preview" formmethod="POST" type="submit">Xem trước</button> <button class="rounded-xl bg-[var(--color-primary)] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"${attr("disabled", !form?.preview || form.preview.errorCount > 0, true)} formaction="?/import" formmethod="POST" type="submit">Tạo kỳ lễ nháp</button></div></form> `);
		if (form?.preview) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="mt-10 space-y-6" aria-labelledby="preview-heading"><div><h2 class="text-2xl font-bold" id="preview-heading">Kết quả xem trước</h2> <p class="mt-1 text-[var(--color-text-muted)]">Kiểm tra kỹ trước khi tạo kỳ lễ nháp.</p></div> <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">`);
			Stat($$renderer, "Phân công", form.preview.assignmentCount);
			$$renderer.push(`<!----> `);
			Stat($$renderer, "Người", form.preview.contactCount);
			$$renderer.push(`<!----> `);
			Stat($$renderer, "Tiểu ban", form.preview.departmentCount);
			$$renderer.push(`<!----> `);
			Stat($$renderer, "Chưa có số", form.preview.missingPhoneCount);
			$$renderer.push(`<!----></div> `);
			if (form.preview.needsReviewCount > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">Có ${escape_html(form.preview.needsReviewCount)} phân công chưa có số điện thoại. Các dòng này vẫn được import
					nhưng nên kiểm tra lại trong màn hình CRUD sau đó.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (form.preview.issues.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<ul class="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><!--[-->`);
				const each_array = ensure_array_like(form.preview.issues);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let issue = each_array[$$index];
					$$renderer.push(`<li>Dòng ${escape_html(issue.line)}: ${escape_html(issue.message)}</li>`);
				}
				$$renderer.push(`<!--]--></ul>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white"><div class="border-b border-[var(--color-border)] px-4 py-3 font-semibold">10 dòng đầu</div> <div class="overflow-x-auto"><table class="min-w-full text-left text-sm"><thead class="bg-[var(--color-surface)] text-[var(--color-text-muted)]"><tr><th class="px-4 py-3 font-medium">Người</th><th class="px-4 py-3 font-medium">Số điện thoại</th><th class="px-4 py-3 font-medium">Ban / vai trò</th></tr></thead><tbody><!--[-->`);
			const each_array_1 = ensure_array_like(form.preview.sample);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];
				$$renderer.push(`<tr class="border-t border-[var(--color-border)]"><td class="px-4 py-3 font-medium">${escape_html(item.displayName)}</td><td class="px-4 py-3">${escape_html(item.phoneDisplay ?? "Chưa có SĐT")}</td><td class="px-4 py-3">${escape_html(item.departmentName)}${escape_html(item.role ? ` · ${item.role}` : "")}</td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div></div></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.createdEvent) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h2 class="text-lg font-bold text-emerald-950">Đã tạo kỳ lễ nháp</h2> <p class="mt-1 text-emerald-900">${escape_html(form.createdEvent.name)} chưa hiển thị trong danh bạ tra cứu cho đến khi được kích hoạt.</p> <form class="mt-4" method="POST"><input name="eventId" type="hidden"${attr("value", form.createdEvent.id)}/> <button class="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white" formaction="?/activate" formmethod="POST" type="submit">Kích hoạt kỳ lễ này</button></form></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main>`);
	});
}
//#endregion
export { _page as default };
