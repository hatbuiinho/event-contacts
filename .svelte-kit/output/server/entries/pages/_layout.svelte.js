import "../../chunks/index-server.js";
import { i as head } from "../../chunks/server.js";
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Danh bạ sự kiện</title>`);
			});
			$$renderer.push(`<meta name="description" content="Tra cứu nhanh liên hệ và phân ban trong kỳ lễ."/> <meta name="theme-color" content="#2f6f63"/> <meta name="mobile-web-app-capable" content="yes"/> <meta name="apple-mobile-web-app-capable" content="yes"/> <meta name="apple-mobile-web-app-status-bar-style" content="default"/> <meta name="apple-mobile-web-app-title" content="Danh bạ"/> <meta name="application-name" content="Danh bạ sự kiện"/> <link rel="icon" href="/icons/icon.svg" type="image/svg+xml"/> <link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png"/> <link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png"/> <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/> <link rel="manifest" href="/site.webmanifest"/>`);
		});
		$$renderer.push(`<main class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">`);
		children($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}
//#endregion
export { _layout as default };
