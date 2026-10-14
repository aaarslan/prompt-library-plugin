import type { ToolName } from './library-service';

export function toolResultText(name: ToolName, data: Record<string, unknown>): string {
  if (name === 'list_templates' || (name === 'open_library' && Array.isArray(data.templates))) {
    return `Returned ${(data.templates as unknown[]).length} template summaries in structuredContent. ${data.hasMore ? 'More templates remain; pass nextCursor as after_id to list_templates.' : 'Catalog page is complete.'} Read a selected body with open_library.`;
  }
  if (name === 'export_library') return 'Private library export page returned in structuredContent. Follow nextCursor as after_id until hasMore is false for each kind.';
  if (name === 'delete_library_data') return 'Workspace library data deleted. Counts and deletion scope are in structuredContent.';
  if (name === 'preview_import') return 'Template import preview returned in structuredContent. Nothing was saved.';
  if (name === 'save_template') return 'Template saved. Its identifier and full content are in structuredContent.';
  if (name === 'prepare_draft' || name === 'update_draft') return 'Draft saved for review. Values, provenance, version, and missing fields are in structuredContent.';
  return 'Selected template or saved draft returned in structuredContent for review. Nothing was executed or submitted.';
}
