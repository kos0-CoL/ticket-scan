import { describe, expect, test } from "vitest";
import { slugify, truncate } from "./text";

describe("truncate", () => {
  test("no toca los textos que entran", () => {
    expect(truncate("hola", 10)).toBe("hola");
    expect(truncate("hola", 4)).toBe("hola");
  });

  test("corta y agrega puntos suspensivos sin pasarse del máximo", () => {
    expect(truncate("supermercado", 8)).toBe("superme…");
  });

  test("acepta otro sufijo", () => {
    expect(truncate("supermercado", 8, "...")).toBe("super...");
  });

  test("con máximo cero devuelve texto vacío", () => {
    expect(truncate("hola", 0)).toBe("");
  });
});

describe("slugify", () => {
  test("pasa a minúsculas, saca acentos y reemplaza símbolos por guiones", () => {
    expect(slugify("Supermercado Día % — 24hs")).toBe("supermercado-dia-24hs");
  });

  test("maneja la eñe y los bordes", () => {
    expect(slugify("  Ñandú & Cía.  ")).toBe("nandu-cia");
  });

  test("colapsa guiones repetidos", () => {
    expect(slugify("---a---b---")).toBe("a-b");
  });

  test("texto vacío", () => {
    expect(slugify("")).toBe("");
  });
});
