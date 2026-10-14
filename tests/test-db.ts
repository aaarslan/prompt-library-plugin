import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import type { LibraryDB } from '../lib/library-service';

export const TEST_LIMITS = {templatesPerWorkspace:2000,draftsPerWorkspace:2000,bytesPerWorkspace:10_000_000,requestsPerMinute:5000,writesPerMinute:5000,globalRequestsPerMinute:10000};

export function createTestDatabase() {
  const sql = new DatabaseSync(':memory:');
  const migrations = new URL('../drizzle/', import.meta.url);
  for (const name of readdirSync(migrations).filter(name => name.endsWith('.sql')).sort()) sql.exec(readFileSync(new URL(name,migrations),'utf8'));
  const database = {
    prepare(query:string) {
      let args:SQLInputValue[] = [];
      return {bind(...values:SQLInputValue[]){args=values;return this;},async all(){return {results:sql.prepare(query).all(...args)};},async first(){return sql.prepare(query).get(...args)||null;},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};
    },
    async batch(statements:{run:()=>Promise<unknown>}[]) {
      sql.exec('BEGIN');
      try {const results=[];for(const statement of statements)results.push(await statement.run());sql.exec('COMMIT');return results;}
      catch(error){sql.exec('ROLLBACK');throw error;}
    },
  };
  return {sql,db:database as unknown as LibraryDB};
}
