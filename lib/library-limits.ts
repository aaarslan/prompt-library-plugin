import { z } from 'zod';
import { InputError } from './prompt-core';

const positive = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const limitsSchema = z.object({
  templatesPerWorkspace: positive,
  draftsPerWorkspace: positive,
  bytesPerWorkspace: positive,
  requestsPerMinute: positive,
  writesPerMinute: positive,
  globalRequestsPerMinute: positive,
}).strict();

export type LibraryLimits = z.infer<typeof limitsSchema>;

export function readLibraryLimits(value: unknown): LibraryLimits {
  try {
    return limitsSchema.parse(typeof value === 'string' ? JSON.parse(value) : value);
  } catch {
    throw new InputError('Library usage limits are not configured. The operator must set PROMPT_LIBRARY_LIMITS before enabling library tools.');
  }
}

export async function claimLibraryRequest(db: D1Database, ownerId: string, write: boolean, limits: LibraryLimits, now = Date.now()) {
  if (!ownerId || /[\u0000-\u001f\u007f]/.test(ownerId)) throw new InputError('Sign in to use your private library.');
  const bucket = Math.floor(now / 60_000);
  const claim = (key: string, requests: number, writes: number, increment: number) => db.prepare(
    'INSERT INTO library_usage (owner_id, bucket, requests, writes) VALUES (?, ?, 1, ?) ON CONFLICT(owner_id) DO UPDATE SET bucket = excluded.bucket, requests = CASE WHEN library_usage.bucket = excluded.bucket THEN library_usage.requests + 1 ELSE 1 END, writes = CASE WHEN library_usage.bucket = excluded.bucket THEN library_usage.writes + excluded.writes ELSE excluded.writes END WHERE (library_usage.bucket != excluded.bucket OR library_usage.requests < ?) AND (library_usage.bucket != excluded.bucket OR library_usage.writes + excluded.writes <= ?)'
  ).bind(key, bucket, increment, requests, writes);
  const results = await db.batch([
    claim('\u001fglobal', limits.globalRequestsPerMinute, limits.globalRequestsPerMinute, 0),
    claim(ownerId, limits.requestsPerMinute, limits.writesPerMinute, Number(write)),
    db.prepare('DELETE FROM library_usage WHERE owner_id IN (SELECT owner_id FROM library_usage WHERE bucket < ? LIMIT 100)').bind(bucket - 1),
  ]);
  if (!results[0].meta.changes || !results[1].meta.changes) {
    throw new InputError('Library request or write budget exceeded. Try again after the current minute. No library content was changed.');
  }
}

export const storedBytesSql = `(COALESCE((SELECT SUM(length(CAST(title || description || body || category AS BLOB))) FROM templates WHERE owner_id = ?), 0) + COALESCE((SELECT SUM(length(CAST(template_snapshot || field_values AS BLOB))) FROM drafts WHERE owner_id = ?), 0))`;

export const byteLength = (value: string) => new TextEncoder().encode(value).length;
