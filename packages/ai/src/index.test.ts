import { describe, it, expect, vi } from 'vitest';
import { getProviderBaseUrl, getOCRPrompt, getCategorizationPrompt } from '../src/index';

describe('ai', () => {
  describe('getProviderBaseUrl', () => {
    it('returns correct URL for OpenRouter', () => {
      expect(getProviderBaseUrl('OpenRouter')).toBe('https://openrouter.ai/api/v1');
    });
    it('returns correct URL for OpenAI', () => {
      expect(getProviderBaseUrl('OpenAI')).toBe('https://api.openai.com/v1');
    });
    it('returns correct URL for Anthropic', () => {
      expect(getProviderBaseUrl('Anthropic')).toBe('https://api.anthropic.com/v1');
    });
    it('returns default for unknown provider', () => {
      expect(getProviderBaseUrl('Unknown')).toBe('https://openrouter.ai/api/v1');
    });
  });

  describe('getOCRPrompt', () => {
    it('returns valid JSON prompt', () => {
      const prompt = getOCRPrompt();
      expect(prompt).toContain('comercio');
      expect(prompt).toContain('fecha');
      expect(prompt).toContain('total');
      expect(prompt).toContain('items');
    });
  });

  describe('getCategorizationPrompt', () => {
    it('generates prompt with valid categories', () => {
      const items = [
        { nombre: 'Leche', cantidad: 2, precio: 150 },
        { nombre: 'Pan', cantidad: 1, precio: 80 },
      ];
      const prompt = getCategorizationPrompt(items);
      expect(prompt).toContain('almacen');
      expect(prompt).toContain('frescos');
      expect(prompt).toContain('Leche');
      expect(prompt).toContain('Pan');
    });
  });
});