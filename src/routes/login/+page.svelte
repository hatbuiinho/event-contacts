<script lang="ts">
	import type { PageData } from './$types';

	type LoginForm = { username?: string; next?: string; error?: string };
	let { data, form }: { data: PageData; form: LoginForm | null } = $props();
</script>

<svelte:head>
	<title>Đăng nhập quản trị</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
	<section class="w-full rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
		<a class="text-sm font-semibold text-[var(--color-primary)]" href="/">← Danh bạ</a>
		<h1 class="mt-5 text-2xl font-bold">Đăng nhập quản trị</h1>
		<p class="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
			Import và chỉnh sửa danh bạ chỉ dành cho Ban quản trị.
		</p>

		{#if form?.error}
			<p
				class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
				role="alert"
			>
				{form.error}
			</p>
		{/if}

		<form action="?/login" class="mt-6 space-y-4" method="POST">
			<input name="next" type="hidden" value={form?.next ?? data.next} />
			<label class="block">
				<span class="mb-2 block text-sm font-semibold">Tên đăng nhập</span>
				<input
					autocomplete="username"
					class="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 ring-[var(--color-primary)] outline-none focus:ring-2"
					name="username"
					value={form?.username ?? ''}
				/>
			</label>
			<label class="block">
				<span class="mb-2 block text-sm font-semibold">Mật khẩu</span>
				<input
					autocomplete="current-password"
					class="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 ring-[var(--color-primary)] outline-none focus:ring-2"
					name="password"
					type="password"
				/>
			</label>
			<button
				aria-label="Đăng nhập"
				class="grid size-12 place-items-center rounded-xl bg-[var(--color-primary)] font-semibold text-white sm:flex sm:w-full sm:justify-center sm:gap-2 sm:px-4 sm:py-3"
				title="Đăng nhập"
				type="submit"
				><svg aria-hidden="true" class="size-5" fill="none" viewBox="0 0 24 24"
					><path
						d="M10 17l5-5-5-5M15 12H3m11-7h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.8"
					/></svg
				><span class="hidden sm:inline">Đăng nhập</span></button
			>
		</form>
	</section>
</main>
