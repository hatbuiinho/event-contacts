import { t as private_env } from "./shared-server.js";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { boolean, date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
//#region src/lib/server/db/client.ts
function getDb() {
	if (!private_env.DATABASE_URL) throw new Error("DATABASE_URL is required to connect to Neon");
	return drizzle({ client: neon(private_env.DATABASE_URL) });
}
function isDatabaseConfigured() {
	return Boolean(private_env.DATABASE_URL);
}
//#endregion
//#region src/lib/server/db/schema.ts
var eventStatus = pgEnum("event_status", [
	"draft",
	"active",
	"archived"
]);
var userRole = pgEnum("user_role", ["admin", "viewer"]);
var events = pgTable("events", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	logoUrl: text("logo_url"),
	status: eventStatus("status").notNull().default("draft"),
	startsOn: date("starts_on"),
	activatedAt: timestamp("activated_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("events_status_idx").on(table.status)]);
var contacts = pgTable("contacts", {
	id: uuid("id").defaultRandom().primaryKey(),
	eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
	displayName: text("display_name").notNull(),
	normalizedName: text("normalized_name").notNull(),
	title: text("title"),
	phoneDisplay: text("phone_display"),
	phoneDigits: text("phone_digits"),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
	index("contacts_event_idx").on(table.eventId),
	index("contacts_event_name_idx").on(table.eventId, table.normalizedName),
	index("contacts_event_phone_idx").on(table.eventId, table.phoneDigits),
	uniqueIndex("contacts_event_phone_unique").on(table.eventId, table.phoneDigits)
]);
var departments = pgTable("departments", {
	id: uuid("id").defaultRandom().primaryKey(),
	eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	normalizedName: text("normalized_name").notNull(),
	sortOrder: integer("sort_order").notNull().default(0),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("departments_event_idx").on(table.eventId), uniqueIndex("departments_event_name_unique").on(table.eventId, table.normalizedName)]);
var memberships = pgTable("memberships", {
	id: uuid("id").defaultRandom().primaryKey(),
	contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
	departmentId: uuid("department_id").notNull().references(() => departments.id, { onDelete: "cascade" }),
	role: text("role").notNull().default(""),
	isSupport: boolean("is_support").notNull().default(false),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
	index("memberships_contact_idx").on(table.contactId),
	index("memberships_department_idx").on(table.departmentId),
	uniqueIndex("memberships_assignment_unique").on(table.contactId, table.departmentId, table.role)
]);
var users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	username: text("username").notNull(),
	displayName: text("display_name").notNull(),
	passwordHash: text("password_hash").notNull(),
	role: userRole("role").notNull().default("viewer"),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [uniqueIndex("users_username_unique").on(table.username)]);
var sessions = pgTable("sessions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("sessions_user_idx").on(table.userId), uniqueIndex("sessions_token_hash_unique").on(table.tokenHash)]);
var importBatches = pgTable("import_batches", {
	id: uuid("id").defaultRandom().primaryKey(),
	eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
	fileName: text("file_name"),
	sourceType: text("source_type").notNull(),
	rowCount: integer("row_count").notNull(),
	summary: jsonb("summary").notNull().default({}),
	createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("import_batches_event_idx").on(table.eventId)]);
//#endregion
export { memberships as a, getDb as c, importBatches as i, isDatabaseConfigured as l, departments as n, sessions as o, events as r, users as s, contacts as t };
