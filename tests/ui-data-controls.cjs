/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS mock harness matches the existing UI tests. */
// No live requests: every export, delete, and library read below is handled by this in-memory mock.
const { JSDOM } = require('jsdom');
const assert = require('node:assert/strict');
const { LIBRARY_HTML } = require('../lib/library-ui.ts');

const builtin = { id: 'builtin', title: 'Built-in starting point', description: '', category: 'Writing', sample: true, body: 'Write about {{topic}}', fields: [{ key: 'topic', label: 'Topic', required: true }] };
const customs = Array.from({ length: 23 }, (_, i) => ({ ...builtin, id: 'custom_' + String(i).padStart(2, '0'), title: 'Private template ' + i, sample: false, body: 'Private content ' + i + ' {{topic}}', createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z' }));
const records = Array.from({ length: 24 }, (_, i) => ({ template: i % 2 ? builtin : customs[i % customs.length], draft: { id: 'draft_' + String(i).padStart(2, '0'), templateId: (i % 2 ? builtin : customs[i % customs.length]).id, version: 1, values: [{ key: 'topic', value: 'Private entered value ' + i, source: 'provided' }], renderedPrompt: 'Private rendered prompt ' + i, missingFields: [], updatedAt: '2026-10-02T00:00:00Z' }, createdAt: '2026-10-01T00:00:00Z' }));
const staleRecord = structuredClone(records[0]);
const calls = [], errors = [];
let dom, holdExport = false, pendingExport = null, holdDelete = false, pendingDelete = null, clipboardBlocked = false, clipboardText = '', failExport = false, repeatCursor = false, failDelete = false, deleted = false, echoLibraryResults = false;
const envelope = structuredContent => ({ content: [], structuredContent });
function response(id, result) { dom.window.dispatchEvent(new dom.window.MessageEvent('message', { source: host, data: { jsonrpc: '2.0', id, result } })); }
function emit(data) { dom.window.dispatchEvent(new dom.window.MessageEvent('message', { source: host, data: { jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: envelope(data) } })); }
function library(args) {
  const available = deleted ? [builtin] : [builtin, ...customs];
  const record = args.draft_id ? records.find(r => r.draft.id === args.draft_id) : null;
  const t = args.template_id ? available.find(t => t.id === args.template_id) : record?.template;
  if ((args.draft_id && !record) || (args.template_id && !t)) return { isError: true, content: [{ type: 'text', text: 'Record not found' }] };
  return envelope({ templates: available, selectedTemplate: t, draft: record?.draft, recentDrafts: records.slice(0, 12).map(r => ({ id: r.draft.id, templateId: r.template.id, title: r.template.title, version: 1 })) });
}
const host = { postMessage(message) {
  calls.push(message);
  setTimeout(() => {
    if (message.method === 'ui/initialize') return response(message.id, { hostCapabilities: { serverTools: {}, message: { text: {} }, updateModelContext: { structuredContent: {} } }, hostContext: { theme: 'light' } });
    if (message.method === 'ui/update-model-context' || message.method === 'ui/message') return response(message.id, {});
    if (message.method !== 'tools/call') return;
    const { name, arguments: args } = message.params;
    if (name === 'open_library') { const result = library(args); if (echoLibraryResults && !result.isError) emit(result.structuredContent); response(message.id, result); if (echoLibraryResults && !result.isError) setTimeout(() => emit(result.structuredContent), 0); return; }
    if (name === 'export_library') {
      const finish = () => {
        if (failExport && args.after_id) return response(message.id, { isError: true, content: [{ type: 'text', text: 'Mock export failure' }] });
        const all = args.kind === 'templates' ? (deleted ? [] : customs) : records;
        const id = r => args.kind === 'templates' ? r.id : r.draft.id;
        const start = args.after_id ? all.findIndex(r => id(r) === args.after_id) + 1 : 0;
        const page = all.slice(start, start + 1);
        const hasMore = start + page.length < all.length;
        response(message.id, envelope({ kind: args.kind, records: page.map(record => { if (args.kind !== 'drafts') return record; const stored = Object.fromEntries(Object.entries(record.draft).filter(([key]) => !['renderedPrompt', 'missingFields'].includes(key))); return { ...record, draft: stored }; }), nextCursor: hasMore ? (repeatCursor && args.after_id ? args.after_id : id(page.at(-1))) : null, hasMore, exportedAt: '2026-10-13T20:00:00Z' }));
      };
      if (holdExport) { holdExport = false; pendingExport = finish; } else finish();
      return;
    }
    if (name === 'delete_library_data') {
      const finish = () => {
        if (failDelete) return response(message.id, { isError: true, content: [{ type: 'text', text: 'Mock deletion response failed' }] });
        deleted = true;
        const count = records.length;
        records.splice(0);
        response(message.id, envelope({ deleted: { templates: customs.length, drafts: count }, templates: [builtin], recentDrafts: [], deletionScope: 'Current authenticated owner only; active app records.' }));
      };
      if (holdDelete) { holdDelete = false; pendingDelete = finish; } else finish();
      return;
    }
    throw new Error('Unexpected mock tool: ' + name);
  }, 0);
} };
dom = new JSDOM(LIBRARY_HTML, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://app.test', beforeParse(window) {
  Object.defineProperty(window, 'parent', { value: host });
  Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: async text => { if (clipboardBlocked) throw new Error('Clipboard blocked'); clipboardText = text; } } });
  window.document.execCommand = () => false;
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  window.addEventListener('error', event => errors.push(event.message));
} });
const $ = selector => dom.window.document.querySelector(selector);
function click(selector) { const element = $(selector); assert(element, selector); assert(!element.disabled, 'Disabled: ' + selector); element.click(); }
function input(selector, value) { const element = $(selector); element.value = value; element.dispatchEvent(new dom.window.Event('input', { bubbles: true })); }
const wait = () => new Promise(resolve => setTimeout(resolve, 25));
const toolCalls = name => calls.filter(c => c.method === 'tools/call' && c.params.name === name);
async function settle() { for (let i = 0; i < 20; i++) { await wait(); if (!$('#export-library').disabled) return; } throw new Error('Mock request did not settle'); }

(async () => {
  await wait();
  emit({ templates: [builtin, ...customs], template: staleRecord.template, draft: staleRecord.draft, recentDrafts: [{ id: staleRecord.draft.id, templateId: staleRecord.template.id, title: staleRecord.template.title, version: 1 }] });
  input('textarea[data-key="topic"]', 'Unsaved private edit');
  click('[data-action="edit-template"]');
  input('#template-title', 'Private editor draft');
  input('#template-body', 'Private editor contents {{topic}}');
  click('#cancel-dialog');
  click('#data-button');
  assert($('#data-dialog').open);
  assert.equal($('#data-dialog').getAttribute('aria-labelledby'), 'data-dialog-title');
  assert.equal(toolCalls('export_library').length, 0, 'Opening controls must be read-only');
  assert.equal(toolCalls('delete_library_data').length, 0);
  assert.match($('#data-export-warning').textContent, /private export contains entered values/);
  assert.match($('#data-delete-warning').textContent, /active records/);
  assert.match($('#data-delete-warning').textContent, /does not delete ChatGPT history or provider backups/);
  assert($('#delete-library-data').disabled);
  input('#data-delete-confirmation', 'delete my library data');
  assert($('#delete-library-data').disabled, 'Confirmation is exact');
  input('#data-delete-confirmation', 'DELETE MY LIBRARY DATA');
  assert(!$('#delete-library-data').disabled);
  $('#data-delete-confirmation').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(toolCalls('delete_library_data').length, 0, 'Typing/Enter alone must never delete');
  click('#done-data-dialog');
  click('#data-button');
  assert.equal($('#data-delete-confirmation').value, '', 'Closing/reopening resets confirmation');

  holdExport = true;
  click('#export-library');
  await wait();
  assert(pendingExport);
  assert($('#data-delete-confirmation').disabled);
  assert($('#delete-library-data').disabled);
  assert($('#done-data-dialog').disabled);
  assert($('#close-data-dialog').disabled);
  assert($('#data-button').disabled);
  const cancel = new dom.window.Event('cancel', { cancelable: true });
  $('#data-dialog').dispatchEvent(cancel);
  assert(cancel.defaultPrevented, 'Cannot close while an export is pending');
  const before = $('#workspace').innerHTML;
  emit({ kind: 'templates', records: customs.slice(0, 10), nextCursor: 'custom_09', hasMore: true, exportedAt: '2026-10-13T20:00:00Z' });
  assert.equal($('#workspace').innerHTML, before, 'Export notifications are not routed into the library');
  pendingExport(); pendingExport = null;
  await settle();
  const exported = JSON.parse($('#data-export-json').value);
  assert.equal(exported.templates.length, 23);
  assert.equal(exported.drafts.length, 24);
  assert.equal(exported.drafts.at(-1).draft.values[0].value, 'Private entered value 23');
  assert.equal(exported.drafts.at(-1).createdAt, '2026-10-01T00:00:00Z');
  assert.equal(exported.drafts.at(-1).template.id, 'builtin', 'Includes original template snapshot');
  assert(!$('#data-export-result').hidden);
  assert.deepEqual(JSON.parse(JSON.stringify(toolCalls('export_library').map(call => call.params.arguments))), [
    ...customs.map((_, i) => i ? { kind: 'templates', after_id: customs[i - 1].id } : { kind: 'templates' }),
    ...records.map((_, i) => i ? { kind: 'drafts', after_id: records[i - 1].draft.id } : { kind: 'drafts' }),
  ]);
  assert(!('renderedPrompt' in exported.drafts[0].draft), 'Exports aggregate stored records without derived rendering fields');
  assert.equal(calls.filter(c => c.method === 'ui/initialize')[0].params.appInfo.version, '1.2.0');
  click('#copy-data-export'); await wait();
  assert.equal(clipboardText, $('#data-export-json').value);
  clipboardBlocked = true;
  click('#copy-data-export'); await wait();
  assert.match($('#data-status').textContent, /Automatic copy is unavailable/);
  assert.equal($('#data-export-json').selectionStart, 0);
  assert.equal($('#data-export-json').selectionEnd, $('#data-export-json').value.length);
  click('#select-data-export');
  assert.equal($('#data-export-json').selectionEnd, $('#data-export-json').value.length);
  console.log('PASS: accessible controls, explicit deletion phrase, no Enter shortcut, guarded pending dialog, sequential full export beyond display limits, private JSON copy and selection fallback.');

  failExport = true;
  click('#export-library'); await settle();
  assert($('#data-export-result').hidden);
  assert.equal($('#data-export-json').value, '');
  assert.match($('#data-error').textContent, /Mock export failure/);
  const failedCount = toolCalls('export_library').length;
  await wait();
  assert.equal(toolCalls('export_library').length, failedCount, 'No automatic export retry');
  failExport = false; repeatCursor = true;
  click('#export-library'); await settle();
  assert.match($('#data-error').textContent, /could not continue safely/);
  assert.equal($('#data-export-json').value, '');
  repeatCursor = false;
  click('#export-library'); await settle();
  assert(!$('#data-export-result').hidden);

  // A malformed deletion-looking payload is not a confirmed deletion result.
  emit({ deleted: { templates: 23, drafts: 24 }, templates: [builtin], recentDrafts: [] });
  assert.equal($('textarea[data-key="topic"]').value, 'Unsaved private edit');
  failDelete = true;
  input('#data-delete-confirmation', 'DELETE MY LIBRARY DATA');
  click('#delete-library-data'); await settle();
  assert.match($('#data-error').textContent, /may have completed/);
  assert.match($('#data-error').textContent, /Nothing was retried automatically/);
  assert.equal(toolCalls('delete_library_data').length, 1);
  assert.equal($('#data-delete-confirmation').value, '');
  assert($('#delete-library-data').disabled);
  assert.equal($('textarea[data-key="topic"]').value, 'Unsaved private edit', 'An error is not a successful deletion');
  await wait();
  assert.equal(toolCalls('delete_library_data').length, 1);
  failDelete = false;
  click('#export-library'); await settle();
  input('#data-delete-confirmation', 'DELETE MY LIBRARY DATA');
  holdDelete = true;
  click('#delete-library-data'); await wait();
  assert(pendingDelete);
  assert.equal($('#data-export-json').value, '', 'Old export is cleared before deletion starts');
  assert($('#data-delete-confirmation').disabled);
  assert($('#delete-library-data').disabled);
  assert($('#copy-data-export').disabled);
  assert($('#done-data-dialog').disabled);
  $('#delete-library-data').click();
  const cancelDelete = new dom.window.Event('cancel', { cancelable: true });
  $('#data-dialog').dispatchEvent(cancelDelete);
  assert(cancelDelete.defaultPrevented);
  const pendingBefore = $('#workspace').innerHTML;
  emit({ template: staleRecord.template, draft: { ...staleRecord.draft, version: 2 } });
  assert.equal($('#workspace').innerHTML, pendingBefore, 'No incoming result can alter a deletion in progress');
  pendingDelete(); pendingDelete = null; await settle();
  assert.equal(toolCalls('delete_library_data').length, 2, 'Repeated click cannot duplicate deletion');
  assert.deepEqual(JSON.parse(JSON.stringify(toolCalls('delete_library_data').at(-1).params.arguments)), { confirmation: 'DELETE MY LIBRARY DATA' });
  assert.equal($('#workspace').innerHTML, '', 'Even hidden prompt DOM is removed');
  assert($('#workspace').hidden);
  assert(!$('#discover').hidden);
  assert.equal($('#data-export-json').value, '');
  assert($('#data-export-result').hidden);
  assert.equal($('#template-title').value, '');
  assert.equal($('#template-body').value, '');
  assert.equal($('#recent-list').innerHTML, '');
  assert($('#recent-drafts').hidden);
  assert($('#recent-mobile').hidden);
  assert($('#local-banner').hidden);
  assert($('#update-banner').hidden);
  assert($('#freshness-banner').hidden);
  assert.equal(dom.window.document.querySelectorAll('[data-template]').length, 1);
  assert($('[data-template="builtin"]'));
  assert.match($('#data-status').textContent, /Deleted 23 custom templates and 24 drafts/);
  const clearedContext = calls.filter(c => c.method === 'ui/update-model-context').at(-1).params.structuredContent;
  assert.equal(clearedContext.draftId, null);
  assert.equal(clearedContext.selectedTemplateId, null);
  console.log('PASS: no partial export on failures/cursor loops, no automatic retries, malformed deletion notification ignored, explicit-action clearing, full state/DOM/cache/editor/export clearing, and built-ins preserved.');

  // Late notifications must be verified against current mock storage before showing anything.
  emit({ template: staleRecord.template, draft: staleRecord.draft });
  await wait();
  assert.equal($('#workspace').innerHTML, '');
  assert.equal(dom.window.document.querySelectorAll('[data-template]').length, 1);
  emit({ templates: [builtin, ...customs], recentDrafts: [{ id: staleRecord.draft.id, title: 'Deleted draft' }] });
  await wait();
  assert.equal(dom.window.document.querySelectorAll('[data-template]').length, 1);
  assert.equal($('#recent-list').innerHTML, '');
  assert($('#local-banner').hidden);
  click('#done-data-dialog');
  click('[data-template="builtin"]'); await wait();
  assert.equal($('textarea[data-key="topic"]').value, '');
  // New post-deletion draft notifications still work, but are read back from storage first.
  const fresh = { template: builtin, draft: { ...staleRecord.draft, id: 'new_draft', templateId: 'builtin', values: [{ key: 'topic', value: 'New safe content', source: 'provided' }], renderedPrompt: 'Write about New safe content' }, createdAt: '2026-10-13T21:00:00Z' };
  records.push(fresh);
  echoLibraryResults = true;
  const readsBeforeEcho = toolCalls('open_library').length;
  emit({ template: builtin, draft: { ...fresh.draft, values: [{ key: 'topic', value: 'Unverified notification text', source: 'provided' }] } });
  await wait();
  assert.equal($('textarea[data-key="topic"]').value, 'New safe content');
  await wait();
  assert.equal(toolCalls('open_library').length, readsBeforeEcho + 1, 'Echoed tool notifications must not start a read loop');
  assert.equal(calls.filter(c => c.method === 'ui/message').length, 0, 'Data controls never execute prompts or send chat messages');

  // A deliberate fill locks the destructive controls until an actual newer draft arrives.
  click('#fill-chat'); await wait();
  assert($('#fill-chat').disabled);
  const deletesBeforeFill = toolCalls('delete_library_data').length;
  click('#data-button');
  assert(!$('#data-delete-pending').hidden);
  assert.match($('#data-delete-pending').textContent, /Wait for it to finish/);
  assert($('#data-delete-controls').hidden);
  assert($('#data-delete-confirmation').disabled);
  assert($('#delete-library-data').disabled);
  input('#data-delete-confirmation', 'DELETE MY LIBRARY DATA');
  $('#delete-library-data').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  await wait();
  assert.equal(toolCalls('delete_library_data').length, deletesBeforeFill, 'Pending fill blocks even a synthetic typed-and-clicked attempt');
  assert.equal($('#data-delete-confirmation').value, '');
  click('#done-data-dialog');
  fresh.draft = { ...fresh.draft, version: 2 };
  emit({ template: builtin, draft: fresh.draft });
  await wait();
  assert(!$('#fill-chat').disabled, 'An actual newer draft completes the fill');
  click('#data-button');
  assert($('#data-delete-pending').hidden);
  assert(!$('#data-delete-confirmation').disabled);
  assert.equal($('#data-delete-confirmation').value, '', 'Completion never preconfirms deletion');
  assert($('#delete-library-data').disabled);
  click('#done-data-dialog');
  input('textarea[data-key="topic"]', 'Unsaved content before host deletion');
  click('[data-action="edit-template"]');
  input('#template-title', 'Private editor before host deletion');
  input('#template-body', 'Private editor body before host deletion');
  click('#cancel-dialog');
  click('#data-button');
  click('#export-library'); await settle();
  assert.match($('#data-export-json').value, /New safe content/);

  // A trusted host reports an already-completed deletion. This only clears this card;
  // it must not issue another deletion, and must invalidate an export already in flight.
  holdExport = true;
  click('#export-library'); await wait();
  assert(pendingExport);
  const deleteCallsBeforeNotification = toolCalls('delete_library_data').length;
  const completedDeletion = { deleted: { templates: 0, drafts: 1 }, templates: [builtin], recentDrafts: [], deletionScope: 'Current authenticated owner only; active app records.' };
  // The same valid payload from an unrelated window must be ignored.
  dom.window.dispatchEvent(new dom.window.MessageEvent('message', { source: dom.window, data: { jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: envelope(completedDeletion) } }));
  assert.equal($('textarea[data-key="topic"]').value, 'Unsaved content before host deletion');
  records.splice(0);
  emit(completedDeletion);
  assert.equal(toolCalls('delete_library_data').length, deleteCallsBeforeNotification);
  assert.equal($('#workspace').innerHTML, '');
  assert.equal($('#data-export-json').value, '');
  assert($('#data-export-result').hidden);
  assert.equal($('#template-title').value, '');
  assert.equal($('#template-body').value, '');
  assert.equal($('#recent-list').innerHTML, '');
  assert($('#local-banner').hidden);
  assert($('#update-banner').hidden);
  assert.match($('#data-status').textContent, /Deleted 0 custom templates and 1 drafts/);
  pendingExport(); pendingExport = null; await settle();
  assert.equal($('#data-export-json').value, '', 'An interrupted export must never publish a stale assembled result');
  assert($('#data-export-result').hidden);
  assert.match($('#data-error').textContent, /deleted while this request was running/);
  emit({ template: builtin, draft: fresh.draft });
  await wait();
  assert.equal($('#workspace').innerHTML, '');
  assert.equal($('#data-export-json').value, '');
  assert.equal(toolCalls('delete_library_data').length, deleteCallsBeforeNotification, 'Clearing after a notification never initiates deletion');
  assert.equal(calls.filter(c => c.method === 'ui/message').length, 1, 'Only the explicit Fill click sent a chat message');
  console.log('PASS: pending fill blocks destructive controls; trusted deletion notifications clear local data without deleting again; in-flight export invalidation keeps deleted text blank.');
  assert.deepEqual(errors, []);
  console.log('PASS: stale deleted notifications cannot restore private data; fresh post-deletion records revalidate successfully; no prompt execution or runtime errors.');
  dom.window.close();
})().catch(error => { console.error(error); console.error('Data error:', $('#data-error').textContent, 'Status:', $('#data-status').textContent); dom.window.close(); process.exit(1); });
