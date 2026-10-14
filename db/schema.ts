import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  body: text('body').notNull(),
  category: text('category').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [index('templates_owner_updated').on(t.ownerId, t.updatedAt), index('templates_owner_id').on(t.ownerId, t.id)]);
export const drafts = sqliteTable('drafts', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  templateId: text('template_id').notNull(),
  templateSnapshot: text('template_snapshot').notNull(),
  fieldValues: text('field_values').notNull(),
  version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [index('drafts_owner_updated').on(t.ownerId, t.updatedAt), index('drafts_owner_id').on(t.ownerId, t.id)]);
export const libraryUsage = sqliteTable('library_usage', {
  ownerId: text('owner_id').primaryKey(),
  bucket: integer('bucket').notNull(),
  requests: integer('requests').notNull(),
  writes: integer('writes').notNull(),
}, t => [index('library_usage_bucket').on(t.bucket)]);
