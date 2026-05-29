import { describe, expect, it } from 'vitest';
import { toFriendlyAiError } from '@/lib/ai/errors';

describe('toFriendlyAiError', () => {
  it('maps 401 to invalid key message', () => {
    expect(toFriendlyAiError(401, 'Unauthorized')).toContain('API キー');
  });

  it('maps 429 to rate limit message', () => {
    expect(toFriendlyAiError(429, 'rate limit exceeded')).toContain('リクエスト制限');
  });

  it('maps 5xx to service error message', () => {
    expect(toFriendlyAiError(503, 'unavailable')).toContain('AI サービス');
  });

  it('includes status for unknown errors', () => {
    expect(toFriendlyAiError(418, 'teapot')).toContain('418');
  });
});
