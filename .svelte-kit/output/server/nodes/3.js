import * as server from '../entries/pages/admin/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.BbIl6GnN.js","_app/immutable/chunks/BX07BZLj.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/gDAyuY9Q.js"];
export const stylesheets = ["_app/immutable/assets/3.DxKaX4RF.css"];
export const fonts = [];
