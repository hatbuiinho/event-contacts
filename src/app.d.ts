// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				username: string;
				displayName: string;
				role: 'admin' | 'viewer';
			} | null;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			appRoute?: boolean;
		}
		// interface Platform {}
	}
}

export {};
