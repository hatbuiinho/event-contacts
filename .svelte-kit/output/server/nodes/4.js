import * as server from '../entries/pages/admin/import/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/import/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/import/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.C3dFEuTE.js","_app/immutable/chunks/BX07BZLj.js","_app/immutable/chunks/xihTtKlq.js"];
export const stylesheets = [];
export const fonts = [];
