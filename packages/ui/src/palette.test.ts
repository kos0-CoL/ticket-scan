import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { tokens } from "./palette";

const css = readFileSync(new URL("./theme.css", import.meta.url), "utf-8");
const declaradas = new Map<string, string>();
for (const m of css.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
  declaradas.set(m[1], m[2].trim());
}
const esperados = new Map<string, string>(Object.entries(tokens));

describe("tokens de diseño", () => {
  test("cada token de palette.ts está en theme.css con el mismo valor", () => {
    for (const [nombre, valor] of esperados) {
      expect(declaradas.get(nombre), nombre).toBe(valor);
    }
  });

  test("cada variable de theme.css está en palette.ts", () => {
    for (const nombre of declaradas.keys()) {
      expect(esperados.has(nombre), nombre).toBe(true);
    }
  });

  test("hay la misma cantidad de tokens en los dos archivos", () => {
    expect(declaradas.size).toBe(esperados.size);
  });
});
