
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const INITIAL_ADMIN_DISPLAY_NAME: string;
	export const INITIAL_ADMIN_PASSWORD: string;
	export const INITIAL_ADMIN_USERNAME: string;
	export const SESSION_SECRET: string;
	export const NODE_ENV: string;
	export const npm_config_version_tag_prefix: string;
	export const COLORTERM: string;
	export const VSCODE_CWD: string;
	export const DEBUG: string;
	export const npm_config_ignore_optional: string;
	export const npm_config_init_version: string;
	export const GIT_PAGER: string;
	export const CODEX_SESSION_ID: string;
	export const npm_package_scripts_prepare: string;
	export const OSLogRateLimit: string;
	export const npm_package_scripts_cap_android: string;
	export const npm_package_devDependencies__types_node: string;
	export const npm_config_ignore_scripts: string;
	export const npm_package_scripts_cap_sync: string;
	export const NODE_REPL_TRUSTED_BROWSER_CLIENT_SHA256S: string;
	export const npm_config_user_agent: string;
	export const BUN_INSTALL: string;
	export const npm_package_devDependencies_prettier_plugin_tailwindcss: string;
	export const VSCODE_CODE_CACHE_PATH: string;
	export const LC_CTYPE: string;
	export const npm_package_scripts_format: string;
	export const LOGNAME: string;
	export const CODEX_INTERNAL_ORIGINATOR_OVERRIDE: string;
	export const npm_package_scripts_db_studio: string;
	export const SHLVL: string;
	export const HOME: string;
	export const npm_package_type: string;
	export const npm_package_dependencies__capacitor_core: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const npm_config_version_commit_hooks: string;
	export const npm_package_devDependencies__iconify_json: string;
	export const XPC_SERVICE_NAME: string;
	export const npm_package_dependencies_cropperjs: string;
	export const MACH_PORT_RENDEZVOUS_PEER_VALDATION: string;
	export const XPC_FLAGS: string;
	export const npm_package_name: string;
	export const LANG: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const VSCODE_NLS_CONFIG: string;
	export const npm_package_scripts_preview: string;
	export const npm_package_devDependencies_drizzle_kit: string;
	export const npm_package_description: string;
	export const npm_package_devDependencies_tailwindcss: string;
	export const PWD: string;
	export const npm_package_scripts_ota_publish: string;
	export const LESS: string;
	export const CODEX_THREAD_ID: string;
	export const npm_config_argv: string;
	export const npm_config_version_git_message: string;
	export const PATH: string;
	export const npm_package_scripts_db_migrate: string;
	export const npm_package_devDependencies_svelte: string;
	export const ZSH: string;
	export const npm_config_bin_links: string;
	export const npm_package_scripts_test_unit: string;
	export const ANDROID_HOME: string;
	export const PAGER: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_package_devDependencies_eslint: string;
	export const npm_package_devDependencies_prettier: string;
	export const npm_package_devDependencies_dotenv: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_config_version_git_sign: string;
	export const npm_package_dependencies_drizzle_orm: string;
	export const CODEX_CI: string;
	export const npm_config_version_git_tag: string;
	export const MallocNanoZone: string;
	export const LSCOLORS: string;
	export const npm_execpath: string;
	export const npm_package_devDependencies__iconify_tailwind4: string;
	export const CODEX_PERMISSION_PROFILE: string;
	export const SSH_AUTH_SOCK: string;
	export const npm_package_dependencies__capacitor_push_notifications: string;
	export const COMMAND_MODE: string;
	export const npm_package_dependencies__capacitor_android: string;
	export const YARN_WRAP_OUTPUT: string;
	export const npm_lifecycle_event: string;
	export const npm_package_devDependencies__sveltejs_adapter_static: string;
	export const npm_package_devDependencies__eslint_js: string;
	export const npm_config_save_prefix: string;
	export const npm_package_private: string;
	export const npm_package_readmeFilename: string;
	export const VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
	export const LC_ALL: string;
	export const npm_package_scripts_db_generate: string;
	export const npm_package_scripts_check_watch: string;
	export const _: string;
	export const npm_config_registry: string;
	export const npm_package_devDependencies__sveltejs_adapter_vercel: string;
	export const npm_package_scripts_build: string;
	export const PYENV_SHELL: string;
	export const __CFBundleIdentifier: string;
	export const USER: string;
	export const TERM: string;
	export const TMPDIR: string;
	export const npm_package_devDependencies_typescript_eslint: string;
	export const npm_node_execpath: string;
	export const APPLICATION_INSIGHTS_NO_STATSBEAT: string;
	export const npm_package_devDependencies__tailwindcss_vite: string;
	export const npm_lifecycle_script: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const npm_package_scripts_lint: string;
	export const VSCODE_PID: string;
	export const NO_COLOR: string;
	export const npm_package_dependencies__sveltejs_kit: string;
	export const npm_config_strict_ssl: string;
	export const npm_package_devDependencies__tailwindcss_forms: string;
	export const NODE: string;
	export const npm_package_devDependencies_vite: string;
	export const npm_package_devDependencies_eslint_config_prettier: string;
	export const npm_config_init_license: string;
	export const SHELL: string;
	export const npm_package_devDependencies_typescript: string;
	export const PYENV_ROOT: string;
	export const RUST_LOG: string;
	export const SVELTEKIT_FORK: string;
	export const npm_package_devDependencies_eslint_plugin_svelte: string;
	export const npm_package_dependencies__neondatabase_serverless: string;
	export const LS_COLORS: string;
	export const GH_PAGER: string;
	export const npm_package_devDependencies_prettier_plugin_svelte: string;
	export const INIT_CWD: string;
	export const npm_package_version: string;
	export const VSCODE_IPC_HOOK: string;
	export const npm_package_devDependencies__tailwindcss_typography: string;
	export const npm_package_scripts_dev: string;
	export const npm_package_dependencies__capgo_capacitor_updater: string;
	export const npm_package_devDependencies__capacitor_cli: string;
	export const npm_package_scripts_check: string;
	export const npm_package_devDependencies_globals: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		DATABASE_URL: string;
		INITIAL_ADMIN_DISPLAY_NAME: string;
		INITIAL_ADMIN_PASSWORD: string;
		INITIAL_ADMIN_USERNAME: string;
		SESSION_SECRET: string;
		NODE_ENV: string;
		npm_config_version_tag_prefix: string;
		COLORTERM: string;
		VSCODE_CWD: string;
		DEBUG: string;
		npm_config_ignore_optional: string;
		npm_config_init_version: string;
		GIT_PAGER: string;
		CODEX_SESSION_ID: string;
		npm_package_scripts_prepare: string;
		OSLogRateLimit: string;
		npm_package_scripts_cap_android: string;
		npm_package_devDependencies__types_node: string;
		npm_config_ignore_scripts: string;
		npm_package_scripts_cap_sync: string;
		NODE_REPL_TRUSTED_BROWSER_CLIENT_SHA256S: string;
		npm_config_user_agent: string;
		BUN_INSTALL: string;
		npm_package_devDependencies_prettier_plugin_tailwindcss: string;
		VSCODE_CODE_CACHE_PATH: string;
		LC_CTYPE: string;
		npm_package_scripts_format: string;
		LOGNAME: string;
		CODEX_INTERNAL_ORIGINATOR_OVERRIDE: string;
		npm_package_scripts_db_studio: string;
		SHLVL: string;
		HOME: string;
		npm_package_type: string;
		npm_package_dependencies__capacitor_core: string;
		npm_package_devDependencies_svelte_check: string;
		npm_config_version_commit_hooks: string;
		npm_package_devDependencies__iconify_json: string;
		XPC_SERVICE_NAME: string;
		npm_package_dependencies_cropperjs: string;
		MACH_PORT_RENDEZVOUS_PEER_VALDATION: string;
		XPC_FLAGS: string;
		npm_package_name: string;
		LANG: string;
		VSCODE_ESM_ENTRYPOINT: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		VSCODE_NLS_CONFIG: string;
		npm_package_scripts_preview: string;
		npm_package_devDependencies_drizzle_kit: string;
		npm_package_description: string;
		npm_package_devDependencies_tailwindcss: string;
		PWD: string;
		npm_package_scripts_ota_publish: string;
		LESS: string;
		CODEX_THREAD_ID: string;
		npm_config_argv: string;
		npm_config_version_git_message: string;
		PATH: string;
		npm_package_scripts_db_migrate: string;
		npm_package_devDependencies_svelte: string;
		ZSH: string;
		npm_config_bin_links: string;
		npm_package_scripts_test_unit: string;
		ANDROID_HOME: string;
		PAGER: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_package_devDependencies_eslint: string;
		npm_package_devDependencies_prettier: string;
		npm_package_devDependencies_dotenv: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_config_version_git_sign: string;
		npm_package_dependencies_drizzle_orm: string;
		CODEX_CI: string;
		npm_config_version_git_tag: string;
		MallocNanoZone: string;
		LSCOLORS: string;
		npm_execpath: string;
		npm_package_devDependencies__iconify_tailwind4: string;
		CODEX_PERMISSION_PROFILE: string;
		SSH_AUTH_SOCK: string;
		npm_package_dependencies__capacitor_push_notifications: string;
		COMMAND_MODE: string;
		npm_package_dependencies__capacitor_android: string;
		YARN_WRAP_OUTPUT: string;
		npm_lifecycle_event: string;
		npm_package_devDependencies__sveltejs_adapter_static: string;
		npm_package_devDependencies__eslint_js: string;
		npm_config_save_prefix: string;
		npm_package_private: string;
		npm_package_readmeFilename: string;
		VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
		LC_ALL: string;
		npm_package_scripts_db_generate: string;
		npm_package_scripts_check_watch: string;
		_: string;
		npm_config_registry: string;
		npm_package_devDependencies__sveltejs_adapter_vercel: string;
		npm_package_scripts_build: string;
		PYENV_SHELL: string;
		__CFBundleIdentifier: string;
		USER: string;
		TERM: string;
		TMPDIR: string;
		npm_package_devDependencies_typescript_eslint: string;
		npm_node_execpath: string;
		APPLICATION_INSIGHTS_NO_STATSBEAT: string;
		npm_package_devDependencies__tailwindcss_vite: string;
		npm_lifecycle_script: string;
		ELECTRON_RUN_AS_NODE: string;
		npm_package_scripts_lint: string;
		VSCODE_PID: string;
		NO_COLOR: string;
		npm_package_dependencies__sveltejs_kit: string;
		npm_config_strict_ssl: string;
		npm_package_devDependencies__tailwindcss_forms: string;
		NODE: string;
		npm_package_devDependencies_vite: string;
		npm_package_devDependencies_eslint_config_prettier: string;
		npm_config_init_license: string;
		SHELL: string;
		npm_package_devDependencies_typescript: string;
		PYENV_ROOT: string;
		RUST_LOG: string;
		SVELTEKIT_FORK: string;
		npm_package_devDependencies_eslint_plugin_svelte: string;
		npm_package_dependencies__neondatabase_serverless: string;
		LS_COLORS: string;
		GH_PAGER: string;
		npm_package_devDependencies_prettier_plugin_svelte: string;
		INIT_CWD: string;
		npm_package_version: string;
		VSCODE_IPC_HOOK: string;
		npm_package_devDependencies__tailwindcss_typography: string;
		npm_package_scripts_dev: string;
		npm_package_dependencies__capgo_capacitor_updater: string;
		npm_package_devDependencies__capacitor_cli: string;
		npm_package_scripts_check: string;
		npm_package_devDependencies_globals: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
