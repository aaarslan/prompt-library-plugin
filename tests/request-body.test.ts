import test from 'node:test';
import assert from 'node:assert/strict';
import { readBoundedJson, RequestBodyError } from '../lib/read-bounded-json';
const encoder = new TextEncoder();
const makeRequest = (body: BodyInit, headers: Record<string,string> = {}) => new Request('https://example.test/mcp', {
  method: 'POST', body, headers, ...{duplex: 'half'},
});
const expectStatus = (status: number) => (error: unknown) => error instanceof RequestBodyError && error.status === status;

test('valid JSON at the exact UTF-8 byte limit is accepted', async () => {
  const body = JSON.stringify({ title: 'أهلاً 🌿' });
  assert.deepEqual(await readBoundedJson(makeRequest(body), encoder.encode(body).length), JSON.parse(body));
});

test('a multibyte body without Content-Length is measured in bytes', async () => {
  const body = JSON.stringify({ text: '界'.repeat(40_000) });
  assert.ok(body.length < 100_000);
  assert.ok(encoder.encode(body).length > 100_000);
  await assert.rejects(readBoundedJson(makeRequest(body)), expectStatus(413));
});

test('an oversized declared length is rejected before a stream read', async () => {
  let reads = 0;
  const stream = new ReadableStream({ pull() { reads += 1; } }, { highWaterMark: 0 });
  const request = makeRequest(stream, { 'content-length': '100001' });
  await assert.rejects(readBoundedJson(request), expectStatus(413));
  assert.equal(reads, 0);
  await request.body?.cancel();
});

test('a falsely small declared length cannot bypass the byte limit', async () => {
  await assert.rejects(readBoundedJson(makeRequest('x'.repeat(101), { 'content-length': '1' }), 100), expectStatus(413));
});

test('a chunked stream is cancelled at the first over-limit chunk', async () => {
  let reads = 0;
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) { reads += 1; controller.enqueue(new Uint8Array(60)); },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  await assert.rejects(readBoundedJson(makeRequest(stream), 100), expectStatus(413));
  assert.equal(reads, 2);
  assert.equal(cancelled, true);
});

test('invalid UTF-8 is rejected rather than silently replaced', async () => {
  const bytes = new Uint8Array([123, 34, 120, 34, 58, 34, 255, 34, 125]);
  await assert.rejects(readBoundedJson(makeRequest(bytes)), expectStatus(400));
});

test('invalid JSON is a parse error', async () => {
  await assert.rejects(readBoundedJson(makeRequest('{broken')), expectStatus(400));
});

test('missing request body is a parse error', async () => {
  const request = new Request('https://example.test/mcp', { method: 'POST' });
  await assert.rejects(readBoundedJson(request), expectStatus(400));
});

test('negative, fractional, and nonnumeric Content-Length values are rejected', async () => {
  for (const length of ['-1', '1.5', 'oops']) {
    await assert.rejects(readBoundedJson(makeRequest('{}', { 'content-length': length })), expectStatus(400));
  }
});

test('the configured limit must be a positive safe integer', async () => {
  for (const limit of [0, -1, 1.5, Infinity]) {
    await assert.rejects(readBoundedJson(makeRequest('{}'), limit), RangeError);
  }
});
