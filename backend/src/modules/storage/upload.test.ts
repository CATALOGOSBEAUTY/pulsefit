import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateUploadInput } from './upload.js';
import { ApiError } from '../../lib/http.js';

describe('validateUploadInput', () => {
  it('rejects external URLs that are not HTTPS', () => {
    assert.throws(
      () => validateUploadInput('javascript:alert(1)'),
      (error) => error instanceof ApiError && error.status === 400
    );
  });

  it('rejects unsafe image mime types', () => {
    assert.throws(
      () => validateUploadInput('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='),
      (error) => error instanceof ApiError && error.status === 400
    );
  });

  it('rejects images above the configured byte limit', () => {
    const tooLarge = Buffer.alloc(8 * 1024 * 1024 + 1).toString('base64');
    assert.throws(
      () => validateUploadInput(`data:image/png;base64,${tooLarge}`),
      (error) => error instanceof ApiError && error.status === 413
    );
  });

  it('accepts safe image data URLs', () => {
    const result = validateUploadInput('data:image/webp;base64,AAAA');
    assert.equal(result.kind, 'data');
    assert.equal(result.mimeType, 'image/webp');
  });
});
