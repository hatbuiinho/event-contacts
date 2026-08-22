
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/import" | "/api" | "/api/directory" | "/login" | "/[...path]";
		RouteParams(): {
			"/[...path]": { path: string }
		};
		LayoutParams(): {
			"/": { path?: string | undefined };
			"/admin": Record<string, never>;
			"/admin/import": Record<string, never>;
			"/api": Record<string, never>;
			"/api/directory": Record<string, never>;
			"/login": Record<string, never>;
			"/[...path]": { path: string }
		};
		Pathname(): "/" | "/admin" | "/admin/import" | "/api/directory" | "/login";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/icons/apple-touch-icon.png" | "/icons/favicon-32.png" | "/icons/icon-192.png" | "/icons/icon-512.png" | "/icons/icon-foreground.svg" | "/icons/icon-maskable-512.png" | "/icons/icon-maskable.svg" | "/icons/icon-round.svg" | "/icons/icon.svg" | "/robots.txt" | "/site.webmanifest" | string & {};
	}
}