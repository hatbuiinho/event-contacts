import { l as isDatabaseConfigured } from "../../../../chunks/schema.js";
import { t as getActiveDirectory } from "../../../../chunks/directory-service.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/directory/+server.ts
var GET = async ({ url }) => {
	const query = url.searchParams.get("q")?.trim() ?? "";
	const departmentId = url.searchParams.get("department")?.trim() || null;
	if (!isDatabaseConfigured()) return json({
		event: null,
		contacts: []
	});
	try {
		return json(await getActiveDirectory({
			query,
			departmentId
		}));
	} catch (error) {
		console.error("[directory-api] database connection failed", error);
		return json({ error: "Không thể kết nối cơ sở dữ liệu." }, { status: 503 });
	}
};
//#endregion
export { GET };
