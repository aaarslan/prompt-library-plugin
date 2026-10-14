export class RequestBodyError extends Error {
  readonly status: 400 | 413;

  constructor(message: string, status: 400 | 413) {
    super(message);
    this.name = 'RequestBodyError';
    this.status = status;
  }
}

export async function readBoundedJson(
  request: Request,
  maxBytes = 100_000,
): Promise<unknown> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new RangeError('maxBytes must be a positive safe integer.');
  }

  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null) {
    const trimmedLength = declaredLength.trim();
    if (!/^\d+$/.test(trimmedLength)) {
      throw new RequestBodyError('Invalid Content-Length.', 400);
    }
    const length = Number(trimmedLength);
    if (!Number.isSafeInteger(length) || length > maxBytes) {
      throw new RequestBodyError('Request too large.', 413);
    }
  }

  if (request.body === null) {
    throw new RequestBodyError('Invalid JSON.', 400);
  }

  const reader = request.body.getReader();
  const bytes = new Uint8Array(maxBytes);
  let used = 0;

  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (chunk.value.byteLength > maxBytes - used) {
        try {
          await reader.cancel('Request body exceeded its byte limit.');
        } catch {}
        throw new RequestBodyError('Request too large.', 413);
      }
      bytes.set(chunk.value, used);
      used += chunk.value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, used));
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestBodyError('Invalid JSON.', 400);
  }
}
