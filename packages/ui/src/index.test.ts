import { describe, it, expect } from 'vitest';
import { cn } from '../src/index';

describe('ui utils', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });
    it('filters falsy values', () => {
      expect(cn('a', false, 'b', null, 'c')).toBe('a b c');
    });
  });
});