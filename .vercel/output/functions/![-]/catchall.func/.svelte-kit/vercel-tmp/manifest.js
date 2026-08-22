export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon-192.png","icons/icon-512.png","icons/icon-foreground.svg","icons/icon-maskable-512.png","icons/icon-maskable.svg","icons/icon-round.svg","icons/icon.svg","robots.txt","site.webmanifest","service-worker.js"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".txt":"text/plain",".webmanifest":"application/manifest+json"},
	_: {
		client: {start:"_app/immutable/entry/start.CB5U8s4s.js",app:"_app/immutable/entry/app.OoeEMlIS.js",imports:["_app/immutable/entry/start.CB5U8s4s.js","_app/immutable/chunks/BacN0YvO.js","_app/immutable/chunks/BX07BZLj.js","_app/immutable/entry/app.OoeEMlIS.js","_app/immutable/chunks/BX07BZLj.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/admin/import",
				pattern: /^\/admin\/import\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/api/directory",
				pattern: /^\/api\/directory\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/directory/_server.ts.js'))
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
