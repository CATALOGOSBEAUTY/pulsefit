import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { handleError } from './http.js';

function responseMock() {
  return {
    statusCode: 0,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

describe('handleError', () => {
  it('hides unexpected error details in production', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const res = responseMock();
      handleError(res as never, new Error('database password leaked in provider error'));
      assert.equal(res.statusCode, 500);
      assert.deepEqual(res.body, { error: 'Erro interno.' });
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it('returns 400 for malformed JSON parse errors', () => {
    const res = responseMock();
    const error = Object.assign(new SyntaxError('Unexpected token }'), {
      status: 400,
      type: 'entity.parse.failed',
    });

    handleError(res as never, error);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'JSON invalido.' });
  });

  it('returns 413 for oversized request bodies', () => {
    const res = responseMock();
    const error = Object.assign(new Error('request entity too large'), {
      status: 413,
      type: 'entity.too.large',
    });

    handleError(res as never, error);

    assert.equal(res.statusCode, 413);
    assert.deepEqual(res.body, { error: 'Payload muito grande.' });
  });
});
