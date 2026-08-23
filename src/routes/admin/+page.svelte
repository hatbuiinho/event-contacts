<script lang="ts">
	import { normalizeText } from '$lib/contacts/normalize';
	import type { PageData } from './$types';

	type Tab = 'contacts' | 'departments' | 'event';
	let { data, form }: { data: PageData; form: { error?: string; success?: string } | null } =
		$props();
	let activeTab = $state<Tab>('contacts');
	let contactQuery = $state('');
	let profileMenuOpen = $state(false);
	let selectedContactId = $state<string | null>(null);
	let isAddingContact = $state(false);
	let newContacts = $state([{ displayName: '', phone: '' }]);
	let bulkContactIds = $state<string[]>([]);
	let bulkDepartmentIds = $state<string[]>([]);
	let departmentPopover = $state<HTMLDetailsElement | null>(null);
	// svelte-ignore state_referenced_locally
	let departmentOrder = $state([...data.departments]);
	let draggedDepartmentId = $state<string | null>(null);
	let dragOverDepartmentId = $state<string | null>(null);
	let selectedContact = $derived(
		data.contacts.find((contact) => contact.id === selectedContactId) ?? null
	);
	let isContactDetail = $derived(isAddingContact || selectedContact !== null);
	let filteredContacts = $derived.by(() => {
		const query = normalizeText(contactQuery);
		const digits = contactQuery.replace(/\D/g, '');
		if (!query && !digits) return data.contacts;
		return data.contacts.filter(
			(contact) =>
				normalizeText(`${contact.displayName} ${contact.title ?? ''}`).includes(query) ||
				(digits.length > 0 && (contact.phoneDisplay ?? '').replace(/\D/g, '').includes(digits))
		);
	});
	function openContact(id: string) {
		selectedContactId = id;
		isAddingContact = false;
	}
	function openNewContact() {
		selectedContactId = null;
		isAddingContact = true;
		newContacts = [{ displayName: '', phone: '' }];
	}
	function closeEditor() {
		selectedContactId = null;
		isAddingContact = false;
	}
	function addContactRow() {
		newContacts.push({ displayName: '', phone: '' });
	}
	function removeContactRow(index: number) {
		if (newContacts.length > 1) newContacts.splice(index, 1);
	}
	function toggleBulkContact(id: string, checked: boolean) {
		bulkContactIds = checked
			? [...new Set([...bulkContactIds, id])]
			: bulkContactIds.filter((contactId) => contactId !== id);
	}
	function toggleBulkDepartment(id: string, checked: boolean) {
		bulkDepartmentIds = checked
			? [...new Set([...bulkDepartmentIds, id])]
			: bulkDepartmentIds.filter((departmentId) => departmentId !== id);
	}
	function toggleAllVisibleContacts(checked: boolean) {
		const visibleIds = filteredContacts.map((contact) => contact.id);
		bulkContactIds = checked
			? [...new Set([...bulkContactIds, ...visibleIds])]
			: bulkContactIds.filter((id) => !visibleIds.includes(id));
	}
	async function moveDepartmentByDrag(targetId: string) {
		if (!draggedDepartmentId || draggedDepartmentId === targetId) return;
		const from = departmentOrder.findIndex((department) => department.id === draggedDepartmentId);
		const to = departmentOrder.findIndex((department) => department.id === targetId);
		if (from < 0 || to < 0) return;
		const next = [...departmentOrder];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		departmentOrder = next;
		await fetch('?/reorderDepartments', {
			method: 'POST',
			body: new URLSearchParams({ order: JSON.stringify(next.map((department) => department.id)) })
		});
	}
	function closeDepartmentPopoverWhenFocusLeaves(event: FocusEvent) {
		const nextTarget = event.relatedTarget;
		if (nextTarget instanceof Node && departmentPopover?.contains(nextTarget)) return;
		departmentPopover?.removeAttribute('open');
	}
</script>

<svelte:head
	><title>Quản trị danh bạ</title><meta
		name="description"
		content="Quản lý liên hệ, tiểu ban và kỳ lễ."
	/></svelte:head
>

<main class="mx-auto min-h-screen max-w-6xl px-4 pb-28 sm:px-6 lg:pb-10">
	<header
		class="admin-topbar sticky top-0 z-30 -mx-4 mb-6 border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-bg)_96%,transparent)] px-4 pt-3 backdrop-blur sm:-mx-6 sm:px-6"
	>
		<div class="flex min-h-14 items-center justify-between gap-3">
			{#if isContactDetail}
				<button
					aria-label="Quay lại danh sách liên hệ"
					class="topbar-back"
					onclick={closeEditor}
					type="button">←</button
				>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-semibold tracking-wider text-[var(--color-primary)] uppercase">
						Liên hệ
					</p>
					<h1 class="truncate text-lg font-bold">
						{isAddingContact ? 'Thêm liên hệ' : selectedContact?.displayName}
					</h1>
				</div>
			{:else}
				<a aria-label="Về danh bạ" class="topbar-back" href="/">←</a>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-semibold tracking-wider text-[var(--color-primary)] uppercase">
						Quản trị
					</p>
					<h1 class="truncate text-lg font-bold">{data.event?.name ?? 'Danh bạ'}</h1>
				</div>
			{/if}
			<div class="relative flex shrink-0 items-center gap-2">
				<button
					aria-expanded={profileMenuOpen}
					aria-haspopup="menu"
					aria-label="Mở menu tài khoản"
					class="profile-trigger"
					onclick={() => (profileMenuOpen = !profileMenuOpen)}
					type="button"
					><span class="profile-avatar"
						><svg aria-hidden="true" viewBox="0 0 24 24"
							><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg
						></span
					><span class="profile-name"
						><strong>{data.user.displayName}</strong><small>Tài khoản</small></span
					><svg class="profile-chevron" aria-hidden="true" fill="none" viewBox="0 0 24 24"
						><path d="m7 10 5 5 5-5" /></svg
					></button
				>
				{#if profileMenuOpen}
					<div
						class="profile-menu absolute top-14 right-0 z-40 w-64 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-xl"
						role="menu"
					>
						<div class="profile-menu-header">
							<span class="profile-avatar"
								><svg aria-hidden="true" viewBox="0 0 24 24"
									><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg
								></span
							>
							<div class="min-w-0">
								<p class="truncate font-semibold">{data.user.displayName}</p>
								<p class="truncate text-sm text-[var(--color-text-muted)]">@{data.user.username}</p>
							</div>
						</div>
						<a
							class="mt-1 block rounded-lg px-3 py-2 font-medium hover:bg-[var(--color-surface)]"
							href="/"
							role="menuitem">Xem danh bạ</a
						>
						<a
							class="mt-1 block rounded-lg px-3 py-2 font-medium hover:bg-[var(--color-surface)]"
							href="/admin/import"
							role="menuitem">Import đại lễ</a
						>
						<form method="POST" action="/login?/logout">
							<button
								class="mt-1 w-full rounded-lg px-3 py-2 text-left font-medium text-red-700 hover:bg-red-50"
								role="menuitem"
								type="submit">Đăng xuất</button
							>
						</form>
					</div>
				{/if}
			</div>
		</div>
		{#if data.event}
			<nav
				aria-label="Khu vực quản trị"
				class="mt-2 hidden gap-1 overflow-x-auto rounded-t-xl border-x border-t border-[var(--color-border)] bg-white p-1 lg:flex"
			>
				<button
					class:tab-active={activeTab === 'contacts'}
					class="tab"
					onclick={() => (activeTab = 'contacts')}
					>Liên hệ <span>{data.contacts.length}</span></button
				>
				<button
					class:tab-active={activeTab === 'departments'}
					class="tab"
					onclick={() => (activeTab = 'departments')}
					>Tiểu ban <span>{data.departments.length}</span></button
				>
				<button
					class:tab-active={activeTab === 'event'}
					class="tab"
					onclick={() => (activeTab = 'event')}>Đại lễ</button
				>
			</nav>
		{/if}
	</header>
	{#if form?.error}<p class="notice notice-error" role="alert">
			{form.error}
		</p>{:else if form?.success}<p class="notice notice-success">{form.success}</p>{/if}
	{#if !data.event}
		<section class="panel p-6">
			<h2 class="text-xl font-bold">Chưa có kỳ lễ đang hoạt động</h2>
			<p class="mt-2 text-[var(--color-text-muted)]">Hãy import và kích hoạt một kỳ lễ trước.</p>
		</section>
	{:else}
		{#if activeTab === 'contacts'}
			<section
				class:showing-detail={isAddingContact || selectedContact !== null}
				class="contacts-workspace grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]"
			>
				<div class="contact-list panel">
					<div class="border-b border-[var(--color-border)] p-4">
						<div class="flex items-center justify-between gap-3">
							<div>
								<h2 class="font-bold">Liên hệ</h2>
								<p class="text-sm text-[var(--color-text-muted)]">Tìm và chọn để chỉnh sửa</p>
							</div>
							<button
								aria-label="Thêm liên hệ"
								class="button-primary action-icon"
								onclick={openNewContact}
								title="Thêm liên hệ"
								><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg
								><span class="action-label">Thêm</span></button
							>
						</div>
						<input
							class="field mt-4"
							bind:value={contactQuery}
							placeholder="Tìm theo tên hoặc số điện thoại"
							type="search"
						/>
						{#if filteredContacts.length > 0}
							<label
								class="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--color-primary-dark)]"
								><input
									aria-label="Chọn tất cả liên hệ đang hiển thị"
									class="app-checkbox"
									checked={filteredContacts.every((contact) => bulkContactIds.includes(contact.id))}
									onchange={(event) => toggleAllVisibleContacts(event.currentTarget.checked)}
									type="checkbox"
								/>Chọn tất cả kết quả</label
							>
						{/if}
						{#if bulkContactIds.length > 0}
							<form
								class="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-lg flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-soft)] p-2 shadow-xl lg:bottom-6"
								method="POST"
							>
								<input name="ids" type="hidden" value={JSON.stringify(bulkContactIds)} />
								<span class="text-xs font-semibold text-[var(--color-primary-dark)]"
									>{bulkContactIds.length} đã chọn</span
								>
								<input
									name="departmentIds"
									type="hidden"
									value={JSON.stringify(bulkDepartmentIds)}
								/>
								<details
									bind:this={departmentPopover}
									class="relative min-w-0 flex-1"
									onfocusout={closeDepartmentPopoverWhenFocusLeaves}
								>
									<summary
										class="cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-2 py-2 text-xs font-medium text-[var(--color-text-secondary)]"
										>{bulkDepartmentIds.length
											? `${bulkDepartmentIds.length} tiểu ban đích`
											: 'Chọn tiểu ban đích'}</summary
									>
									<div
										class="absolute bottom-[calc(100%+0.5rem)] left-0 z-30 max-h-52 w-64 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white p-1 shadow-xl"
									>
										{#each data.departments as department}<label
												class="flex items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-[var(--color-surface)]"
												><input
													class="app-checkbox"
													checked={bulkDepartmentIds.includes(department.id)}
													onchange={(event) =>
														toggleBulkDepartment(department.id, event.currentTarget.checked)}
													type="checkbox"
												/><span>{department.name}</span></label
											>{/each}
									</div>
								</details>
								<button
									aria-label="Chuyển tiểu ban"
									class="button-primary action-icon"
									disabled={bulkDepartmentIds.length === 0}
									formaction="?/bulkMoveContacts"
									title="Chuyển tiểu ban"
									type="submit"
									><svg aria-hidden="true" viewBox="0 0 24 24"
										><path d="m14 7 5 5-5 5M19 12H5" /></svg
									><span class="action-label">Chuyển</span></button
								>
								<button
									aria-label="Xóa các liên hệ đã chọn"
									class="button-danger action-icon"
									formaction="?/bulkDeleteContacts"
									onclick={(event) => {
										if (!confirm(`Xóa ${bulkContactIds.length} liên hệ đã chọn?`))
											event.preventDefault();
									}}
									title="Xóa đã chọn"
									type="submit"
									><svg aria-hidden="true" viewBox="0 0 24 24"
										><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" /></svg
									><span class="action-label">Xóa</span></button
								>
							</form>
						{/if}
					</div>
					<div class="max-h-[65vh] overflow-y-auto p-2">
						{#if filteredContacts.length === 0}<p
								class="p-4 text-center text-sm text-[var(--color-text-muted)]"
							>
								Không có liên hệ phù hợp.
							</p>{:else}{#each filteredContacts as contact}<div class="flex items-center gap-1">
									<label class="grid size-9 shrink-0 place-items-center"
										><input
											aria-label={`Chọn ${contact.displayName}`}
											class="app-checkbox"
											checked={bulkContactIds.includes(contact.id)}
											onchange={(event) =>
												toggleBulkContact(contact.id, event.currentTarget.checked)}
											type="checkbox"
										/></label
									><button
										class:selected={contact.id === selectedContactId}
										class="contact-row"
										onclick={() => openContact(contact.id)}
										><span class="min-w-0 text-left"
											><strong class="block truncate">{contact.displayName}</strong><span
												class="block truncate text-sm text-[var(--color-text-muted)]"
												>{contact.phoneDisplay ?? 'Chưa có số điện thoại'}</span
											></span
										><span class="shrink-0 text-xs text-[var(--color-text-muted)]"
											>{contact.memberships.length} ban</span
										></button
									>
								</div>{/each}{/if}
					</div>
				</div>
				<div class="contact-editor panel p-5">
					{#if isAddingContact}
						<h2 class="mt-3 text-lg font-bold">Thêm liên hệ</h2>
						<p class="mt-1 text-sm text-[var(--color-text-muted)]">
							Thêm nhanh nhiều người rồi lưu một lần.
						</p>
						<form class="mt-4 space-y-3" method="POST">
							<input name="eventId" type="hidden" value={data.event.id} />
							<input name="entries" type="hidden" value={JSON.stringify(newContacts)} />
							{#each newContacts as contact, index}
								<div
									class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
								>
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm font-semibold">Liên hệ {index + 1}</span
										>{#if newContacts.length > 1}<button
												class="text-sm font-semibold text-red-700"
												onclick={() => removeContactRow(index)}
												type="button">Xóa dòng</button
											>{/if}
									</div>
									<div class="grid gap-2 sm:grid-cols-2">
										<input
											class="field"
											bind:value={contact.displayName}
											placeholder="Họ và tên *"
											required
										/><input
											class="field"
											bind:value={contact.phone}
											inputmode="tel"
											placeholder="Số điện thoại"
										/>
									</div>
								</div>
							{/each}
							<button
								aria-label="Thêm dòng liên hệ"
								class="button-secondary action-icon w-full"
								onclick={addContactRow}
								title="Thêm dòng"
								type="button"
								><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg
								><span class="action-label">Thêm dòng</span></button
							>
							>
							<div class="flex gap-2">
								<button
									aria-label={`Lưu ${newContacts.length} liên hệ`}
									class="button-primary action-icon"
									formaction="?/createContacts"
									title={`Lưu ${newContacts.length} liên hệ`}
									type="submit"
									><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg
									><span class="action-label">Lưu {newContacts.length} liên hệ</span></button
								><button
									aria-label="Hủy"
									class="button-secondary action-icon"
									onclick={() => (isAddingContact = false)}
									title="Hủy"
									type="button"
									><svg aria-hidden="true" viewBox="0 0 24 24"
										><path d="m6 6 12 12M18 6 6 18" /></svg
									><span class="action-label">Hủy</span></button
								>
							</div>
						</form>
					{:else if selectedContact}
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="mt-3 text-sm text-[var(--color-text-muted)]">Chỉnh sửa liên hệ</p>
								<h2 class="text-lg font-bold">{selectedContact.displayName}</h2>
							</div>
							<button
								aria-label="Xóa liên hệ"
								class="button-danger action-icon"
								form="delete-contact"
								title="Xóa liên hệ"
								type="submit"
								><svg aria-hidden="true" viewBox="0 0 24 24"
									><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" /></svg
								><span class="action-label">Xóa</span></button
							>
						</div>
						<form class="mt-4 space-y-3" method="POST">
							<input name="id" type="hidden" value={selectedContact.id} /><label
								><span class="label">Họ và tên *</span><input
									class="field"
									name="displayName"
									value={selectedContact.displayName}
									required
								/></label
							><label
								><span class="label">Số điện thoại</span><input
									class="field"
									name="phone"
									value={selectedContact.phoneDisplay ?? ''}
									inputmode="tel"
								/></label
							><label
								><span class="label">Chức danh / danh xưng</span><input
									class="field"
									name="title"
									value={selectedContact.title ?? ''}
								/></label
							><label
								><span class="label">Ghi chú</span><textarea class="field" name="notes"
									>{selectedContact.notes ?? ''}</textarea
								></label
							><button
								aria-label="Lưu thay đổi"
								class="button-primary action-icon"
								formaction="?/updateContact"
								title="Lưu thay đổi"
								type="submit"
								><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg><span
									class="action-label">Lưu thay đổi</span
								></button
							>
						</form>
						<form
							id="delete-contact"
							method="POST"
							onsubmit={(event) => {
								if (!confirm('Xóa liên hệ sẽ xóa toàn bộ phân công của người này.'))
									event.preventDefault();
							}}
						>
							<input name="id" type="hidden" value={selectedContact.id} /><button
								formaction="?/deleteContact"
								type="submit"
								class="hidden">Xóa</button
							>
						</form>
						<div class="mt-6 border-t border-[var(--color-border)] pt-5">
							<h3 class="font-bold">Phân công ({selectedContact.memberships.length})</h3>
							<div class="mt-3 flex flex-wrap gap-2">
								{#each selectedContact.memberships as membership}<form
										method="POST"
										onsubmit={(event) => {
											if (!confirm('Xóa phân công này?')) event.preventDefault();
										}}
									>
										<input name="id" type="hidden" value={membership.id} /><button
											class="tag"
											formaction="?/deleteMembership"
											type="submit"
											>{membership.departmentName}{membership.role
												? ` · ${membership.role}`
												: ''}{membership.isSupport ? ' · Hỗ trợ' : ''} ×</button
										>
									</form>{/each}
							</div>
							<form class="mt-4 grid gap-2 sm:grid-cols-2" method="POST">
								<input name="contactId" type="hidden" value={selectedContact.id} /><select
									class="field"
									name="departmentId"
									required
									><option value="">Thêm vào tiểu ban…</option
									>{#each data.departments as department}<option value={department.id}
											>{department.name}</option
										>{/each}</select
								><input class="field" name="role" placeholder="Vai trò (không bắt buộc)" /><label
									class="flex items-center gap-2 text-sm"
									><input name="isSupport" type="checkbox" /> Hỗ trợ</label
								><button
									class="button-secondary sm:col-span-2"
									formaction="?/createMembership"
									type="submit">Thêm phân công</button
								>
							</form>
						</div>
					{:else}<div
							class="flex min-h-64 items-center justify-center text-center text-[var(--color-text-muted)]"
						>
							Chọn một liên hệ bên trái để chỉnh sửa,<br />hoặc thêm liên hệ mới.
						</div>{/if}
				</div>
			</section>
		{:else if activeTab === 'departments'}
			<section class="panel p-5">
				<h2 class="text-lg font-bold">Tiểu ban</h2>
				<p class="mt-1 text-sm text-[var(--color-text-muted)]">
					Xóa một tiểu ban không xóa liên hệ, chỉ xóa phân công thuộc tiểu ban đó.
				</p>
				<form class="mt-5 flex gap-2" method="POST">
					<input name="eventId" type="hidden" value={data.event.id} /><input
						class="field"
						name="name"
						placeholder="Tên tiểu ban mới"
						required
					/><button
						aria-label="Thêm tiểu ban"
						class="button-primary action-icon shrink-0"
						formaction="?/createDepartment"
						title="Thêm tiểu ban"
						type="submit"
						><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg><span
							class="action-label">Thêm</span
						></button
					>
				</form>
				<div class="admin-list-scroll mt-5 space-y-2">
					{#each departmentOrder as department}<form
							draggable="true"
							class:drag-over={dragOverDepartmentId === department.id &&
								draggedDepartmentId !== department.id}
							class="flex gap-2"
							ondragend={() => {
								draggedDepartmentId = null;
								dragOverDepartmentId = null;
							}}
							ondragenter={() => (dragOverDepartmentId = department.id)}
							ondragover={(event) => event.preventDefault()}
							ondragstart={() => (draggedDepartmentId = department.id)}
							ondrop={(event) => {
								event.preventDefault();
								void moveDepartmentByDrag(department.id);
							}}
							method="POST"
							onsubmit={(event) => {
								if (
									(event.submitter as HTMLButtonElement)?.value === 'delete' &&
									!confirm('Xóa tiểu ban và các phân công thuộc ban này?')
								)
									event.preventDefault();
							}}
						>
							<input name="id" type="hidden" value={department.id} /><input
								class="field"
								name="name"
								value={department.name}
								required
							/><span class="drag-handle" aria-hidden="true">⋮⋮</span><button
								aria-label={`Lưu ${department.name}`}
								class="button-secondary action-icon"
								formaction="?/updateDepartment"
								title="Lưu"
								type="submit"
								><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg><span
									class="action-label">Lưu</span
								></button
							><button
								aria-label={`Xóa ${department.name}`}
								class="button-danger action-icon"
								formaction="?/deleteDepartment"
								name="intent"
								title="Xóa"
								type="submit"
								value="delete"
								><svg aria-hidden="true" viewBox="0 0 24 24"
									><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" /></svg
								><span class="action-label">Xóa</span></button
							>
						</form>{/each}
				</div>
			</section>
		{:else}
			<section class="panel max-w-2xl p-5">
				<h2 class="text-lg font-bold">Thông tin kỳ lễ</h2>
				<form class="mt-5 space-y-4" method="POST">
					<input name="eventId" type="hidden" value={data.event.id} /><label
						><span class="label">Tên kỳ lễ</span><input
							class="field"
							name="name"
							value={data.event.name}
							required
						/></label
					><label
						><span class="label">URL logo</span><input
							class="field"
							name="logoUrl"
							placeholder="https://…"
							value={data.event.logoUrl ?? ''}
						/><span class="mt-1 block text-xs text-[var(--color-text-muted)]"
							>Để trống để dùng logo mặc định.</span
						></label
					><button class="button-primary" formaction="?/updateEvent" type="submit"
						>Lưu thông tin</button
					>
				</form>
			</section>
		{/if}
	{/if}
</main>

{#if data.event && !isContactDetail && bulkContactIds.length === 0}
	<nav aria-label="Điều hướng quản trị" class="admin-bottom-bar lg:hidden">
		<button
			class:bottom-active={activeTab === 'contacts'}
			class="bottom-item"
			onclick={() => (activeTab = 'contacts')}
			><svg aria-hidden="true" viewBox="0 0 24 24"
				><path
					d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
				/></svg
			>Liên hệ</button
		>
		<button
			class:bottom-active={activeTab === 'departments'}
			class="bottom-item"
			onclick={() => (activeTab = 'departments')}
			><svg aria-hidden="true" viewBox="0 0 24 24"
				><path d="M4 21V10m8 11V3m8 18v-7M2 10h4M10 3h4m4 11h4" /></svg
			>Tiểu ban</button
		>
		<button
			class:bottom-active={activeTab === 'event'}
			class="bottom-item"
			onclick={() => (activeTab = 'event')}
			><svg aria-hidden="true" viewBox="0 0 24 24"
				><path d="M12 3 4 7v5c0 5 3.4 8.74 8 10 4.6-1.26 8-5 8-10V7l-8-4Zm0 5v8m-4-4h8" /></svg
			>Đại lễ</button
		>
	</nav>
{/if}

<style>
	.panel {
		border: 1px solid var(--color-border);
		border-radius: 1rem;
		background: white;
	}
	.field {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: white;
		padding: 0.7rem 0.85rem;
		outline: none;
	}
	.field:focus {
		box-shadow: 0 0 0 2px var(--color-primary);
	}
	.label {
		display: block;
		margin-bottom: 0.35rem;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.button-primary,
	.button-secondary,
	.button-danger {
		min-height: 2.75rem;
		border-radius: 0.75rem;
		padding: 0.7rem 1rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.button-primary {
		background: var(--color-primary);
		color: white;
	}
	.button-secondary {
		border: 1px solid var(--color-primary);
		color: var(--color-primary);
	}
	.button-danger {
		border: 1px solid #fecaca;
		color: #b91c1c;
	}
	.action-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
	}
	.action-icon svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.9;
	}
	.app-checkbox {
		width: 1.05rem;
		height: 1.05rem;
		margin: 0;
		border: 1px solid var(--color-border-strong);
		border-radius: 0.3rem;
		accent-color: var(--color-primary);
	}
	.app-checkbox:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}
	@media (max-width: 639px) {
		.action-label {
			display: none;
		}
		.button-primary.action-icon:not(.w-full),
		.button-secondary.action-icon:not(.w-full),
		.button-danger.action-icon:not(.w-full) {
			width: 2.75rem;
			padding-right: 0;
			padding-left: 0;
		}
	}
	.notice {
		margin-bottom: 1.5rem;
		border-radius: 0.75rem;
		padding: 0.8rem 1rem;
	}
	.notice-error {
		border: 1px solid #fecaca;
		background: #fef2f2;
		color: #991b1b;
	}
	.notice-success {
		border: 1px solid #bbf7d0;
		background: #f0fdf4;
		color: #166534;
	}
	.tab {
		border-radius: 0.7rem;
		padding: 0.65rem 0.85rem;
		font-weight: 600;
		color: var(--color-text-muted);
		white-space: nowrap;
	}
	.tab span {
		margin-left: 0.3rem;
		font-size: 0.75rem;
	}
	.tab-active {
		background: var(--color-primary);
		color: white;
	}
	.contact-row {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-radius: 0.75rem;
		padding: 0.8rem;
	}
	.contact-row:hover {
		background: var(--color-surface);
	}
	.contact-row.selected {
		background: color-mix(in srgb, var(--color-primary) 12%, white);
	}
	.drag-handle {
		display: grid;
		width: 2rem;
		place-items: center;
		color: var(--color-text-muted);
		letter-spacing: -0.18rem;
		cursor: grab;
	}
	.drag-over {
		border-top: 3px dashed var(--color-primary);
		padding-top: 0.45rem;
	}
	.admin-list-scroll {
		max-height: min(60dvh, 38rem);
		overflow-y: auto;
		padding-right: 0.2rem;
	}
	.tag {
		min-height: 2.5rem;
		border-radius: 0.6rem;
		background: var(--color-surface);
		padding: 0.45rem 0.6rem;
		font-size: 0.875rem;
	}
	.topbar-back {
		display: grid;
		size: 2.75rem;
		flex: none;
		place-items: center;
		border-radius: 0.75rem;
		color: var(--color-primary);
		font-size: 1.4rem;
		font-weight: 700;
	}
	.topbar-back:hover {
		background: var(--color-surface);
	}
	.profile-trigger {
		display: flex;
		min-height: 2.75rem;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: white;
		padding: 0.25rem 0.5rem 0.25rem 0.25rem;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
	}
	.profile-avatar {
		display: grid;
		width: 2rem;
		height: 2rem;
		flex: none;
		place-items: center;
		border-radius: 0.6rem;
		background: var(--color-primary);
		color: white;
	}
	.profile-avatar svg {
		width: 1.25rem;
		height: 1.25rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-width: 1.8;
	}
	.profile-name {
		display: none;
		min-width: 0;
		text-align: left;
	}
	.profile-name strong,
	.profile-name small {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.profile-name strong {
		max-width: 7rem;
		font-size: 0.75rem;
	}
	.profile-name small {
		color: var(--color-text-muted);
		font-size: 0.65rem;
	}
	.profile-chevron {
		width: 1rem;
		height: 1rem;
		color: var(--color-text-muted);
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2;
	}
	.profile-menu-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-radius: 0.75rem;
		background: var(--color-surface);
		padding: 0.75rem;
	}
	@media (min-width: 640px) {
		.profile-name {
			display: block;
		}
	}
	.admin-bottom-bar {
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 40;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid var(--color-border);
		background: color-mix(in srgb, white 94%, transparent);
		padding: 0.45rem 0.5rem max(0.45rem, env(safe-area-inset-bottom));
		backdrop-filter: blur(12px);
	}
	.bottom-item {
		display: grid;
		min-height: 3.5rem;
		place-content: center;
		gap: 0.1rem;
		border-radius: 0.75rem;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		font-weight: 600;
	}
	.bottom-item svg {
		width: 1.2rem;
		height: 1.2rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}
	.bottom-active {
		background: color-mix(in srgb, var(--color-primary) 12%, white);
		color: var(--color-primary);
	}
	@media (max-width: 1023px) {
		.contacts-workspace:not(.showing-detail) .contact-editor {
			display: none;
		}
		.contacts-workspace.showing-detail .contact-list {
			display: none;
		}
		.contact-editor {
			min-height: calc(100dvh - 12rem);
		}
	}
</style>
