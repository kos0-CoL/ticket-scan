import { describe, it, expect, vi } from 'vitest';
import {
  categorizeInputSchema,
  categorizeOutputSchema,
  getPromptVersion,
  getAvailablePromptVersions,
  buildCategorizationMessages,
  calculateCategorizationCost,
  logCategorization,
} from '../src/categorization';

describe('categorization', () => {
  describe('categorizeInputSchema', () => {
    it('validates correct input', () => {
      const input = {
        ticket_id: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          { nombre: 'Leche', cantidad: 2, precio: 150 },
          { nombre: 'Pan', cantidad: 1, precio: 80 },
        ],
      };
      const result = categorizeInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid ticket_id', () => {
      const input = {
        ticket_id: 'invalid-uuid',
        items: [{ nombre: 'Leche', cantidad: 2, precio: 150 }],
      };
      const result = categorizeInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects empty items', () => {
      const input = {
        ticket_id: '123e4567-e89b-12d3-a456-426614174000',
        items: [],
      };
      const result = categorizeInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects negative cantidad', () => {
      const input = {
        ticket_id: '123e4567-e89b-12d3-a456-426614174000',
        items: [{ nombre: 'Leche', cantidad: -1, precio: 150 }],
      };
      const result = categorizeInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects negative precio', () => {
      const input = {
        ticket_id: '123e4567-e89b-12d3-a456-426614174000',
        items: [{ nombre: 'Leche', cantidad: 2, precio: -10 }],
      };
      const result = categorizeInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('categorizeOutputSchema', () => {
    it('validates correct output', () => {
      const output = [
        { nombre: 'Leche', categoria: 'lacteos', subcategoria: 'leche_entera' },
        { nombre: 'Pan', categoria: 'panaderia' },
      ];
      const result = categorizeOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('rejects invalid categoria', () => {
      const output = [
        { nombre: 'Leche', categoria: 'invalid_category' },
      ];
      const result = categorizeOutputSchema.safeParse(output);
      expect(result.success).toBe(false);
    });

    it('accepts all valid categories', () => {
      const validCategories = [
        'almacen', 'frescos', 'lacteos', 'bebidas', 'limpieza',
        'congelados', 'carnes', 'frutas_y_verduras', 'panaderia', 'otros'
      ];
      
      for (const cat of validCategories) {
        const output = [{ nombre: 'Test', categoria: cat }];
        const result = categorizeOutputSchema.safeParse(output);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('getPromptVersion', () => {
    it('returns v1 prompt version', () => {
      const prompt = getPromptVersion('v1');
      expect(prompt.version).toBe('v1');
      expect(prompt.systemPrompt).toContain('categorización');
      expect(prompt.userPromptTemplate).toBeDefined();
    });

    it('returns v2 prompt version', () => {
      const prompt = getPromptVersion('v2');
      expect(prompt.version).toBe('v2');
      expect(prompt.systemPrompt).toContain('alta precisión');
      expect(prompt.userPromptTemplate).toBeDefined();
    });

    it('falls back to v1 for unknown version', () => {
      const prompt = getPromptVersion('v999');
      expect(prompt.version).toBe('v1');
    });
  });

  describe('getAvailablePromptVersions', () => {
    it('returns available versions', () => {
      const versions = getAvailablePromptVersions();
      expect(versions).toContain('v1');
      expect(versions).toContain('v2');
    });
  });

  describe('buildCategorizationMessages', () => {
    it('builds messages with v1 prompt', () => {
      const items = [
        { nombre: 'Leche', cantidad: 2, precio: 150 },
        { nombre: 'Pan', cantidad: 1, precio: 80 },
      ];
      const messages = buildCategorizationMessages(items, 'v1');
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toContain('Leche');
      expect(messages[1].content).toContain('Pan');
    });

    it('builds messages with v2 prompt', () => {
      const items = [
        { nombre: 'Leche', cantidad: 2, precio: 150 },
      ];
      const messages = buildCategorizationMessages(items, 'v2');
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toContain('CATEGORIZACIÓN DE PRODUCTOS');
    });
  });

  describe('calculateCategorizationCost', () => {
    it('calculates cost for known model', () => {
      const cost = calculateCategorizationCost('google/gemini-1.5-flash', 1000, 500);
      // (1000/1M * 0.075) + (500/1M * 0.3) = 0.000075 + 0.00015 = 0.000225
      expect(cost).toBeCloseTo(0.000225, 6);
    });

    it('uses fallback pricing for unknown model', () => {
      const cost = calculateCategorizationCost('unknown/model', 1000, 500);
      // (1000/1M * 0.15) + (500/1M * 0.6) = 0.00015 + 0.0003 = 0.00045
      expect(cost).toBeCloseTo(0.00045, 6);
    });

    it('returns 0 for zero tokens', () => {
      const cost = calculateCategorizationCost('google/gemini-1.5-flash', 0, 0);
      expect(cost).toBe(0);
    });
  });

  describe('logCategorization', () => {
    it('logs without throwing', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      expect(() => {
        logCategorization('info', 'Test message', {
          requestId: 'test-123',
          userId: 'user-123',
        });
      }).not.toThrow();
      consoleSpy.mockRestore();
    });

    it('logs error level', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        logCategorization('error', 'Error message', {
          requestId: 'test-123',
          error: 'Something went wrong',
        });
      }).not.toThrow();
      consoleSpy.mockRestore();
    });

    it('logs warn level', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => {
        logCategorization('warn', 'Warning message', {
          requestId: 'test-123',
        });
      }).not.toThrow();
      consoleSpy.mockRestore();
    });
  });
});