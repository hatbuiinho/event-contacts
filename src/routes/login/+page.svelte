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
				class="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 font-semibold text-white"
				type="submit">Đăng nhập</button
			>
		</form>
	</section>
</main>
