import { describe, test, expect } from 'vitest';
import { tokens } from './palette';
import { readFileSync } from 'node:fs';

describe('palette tokens consistency', () => {
  const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf-8');

  // Extract all --variable: value; declarations from the CSS
  const cssVars = new Map<string, string>();
  const cssVarRegex = /(--[a-zA-Z0-9-]+):\s*([^;]+);/g;
  let match;
  while ((match = cssVarRegex.exec(css)) !== null) {
    const [, name, value] = match;
    cssVars.set(name.trim(), value.trim());
  }

  test('each token appears in CSS', () => {
    for (const [name, value] of Object.entries(tokens)) {
      expect((tokens as Record<string, string>)[name]).toBe(value);
    }
  });

  test('each CSS variable exists in tokens', () => {
    for (const [name, value] of cssVars) {
      expect(tokens).toHaveProperty(name);
      expect((tokens as Record<string, string>)[name]).toBe(value);
    }
  });
});
