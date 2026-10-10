import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatNumber, formatDate, formatDateTime, truncate, slugify, generateId, debounce, throttle, classNames } from '../src/index';

describe('utils', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });
    it('filters falsy values', () => {
      expect(cn('a', false, 'b', null, 'c')).toBe('a b c');
    });
  });

  describe('formatCurrency', () => {
    it('formats ARS currency', () => {
      expect(formatCurrency(123450)).toMatch(/^\$\s*123\.450$/);
    });
    it('handles zero', () => {
      expect(formatCurrency(0)).toMatch(/^\$\s*0$/);
    });
  });

  describe('formatNumber', () => {
    it('formats with locale', () => {
      expect(formatNumber(1234567)).toBe('1.234.567');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date', () => {
      expect(formatDate('2025-01-15')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
    it('formats Date object', () => {
      expect(formatDate(new Date('2025-01-15T12:00:00.000Z'))).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTime', () => {
    it('formats ISO datetime', () => {
      expect(formatDateTime('2025-01-15T14:30:00')).toMatch(/\d{2}\/\d{2}\/\d{4}.*2:30/);
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello wo...');
    });
    it('returns original if shorter', () => {
      expect(truncate('hi', 10)).toBe('hi');
    });
  });

  describe('slugify', () => {
    it('converts to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });
    it('removes special chars', () => {
      expect(slugify('Hola@Mundo!')).toBe('holamundo');
    });
  });

  describe('generateId', () => {
    it('generates unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('debounce', () => {
    it('delays execution', async () => {
      let count = 0;
      const fn = () => count++;
      const debounced = debounce(fn, 50);
      debounced();
      debounced();
      expect(count).toBe(0);
      await new Promise(r => setTimeout(r, 60));
      expect(count).toBe(1);
    });
  });

  describe('throttle', () => {
    it('limits execution rate', async () => {
      let count = 0;
      const fn = () => count++;
      const throttled = throttle(fn, 50);
      throttled();
      throttled();
      throttled();
      expect(count).toBe(1);
      await new Promise(r => setTimeout(r, 60));
      throttled();
      expect(count).toBe(2);
    });
  });

  describe('classNames', () => {
    it('joins truthy classes', () => {
      expect(classNames('a', true && 'b', false && 'c', 'd')).toBe('a b d');
    });
  });
});