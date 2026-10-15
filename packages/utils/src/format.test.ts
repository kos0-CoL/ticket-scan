import { describe, expect, test } from "vitest";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "./format";

// Intl usa espacios especiales (no separables) entre el símbolo y el número.
const normalizar = (texto: string) => texto.replace(/[\u00a0\u202f]/g, " ");

describe("formatCurrency", () => {
  test("pesos argentinos por defecto", () => {
    expect(normalizar(formatCurrency(1234.5))).toBe("$ 1.234,50");
  });

  test("cero y negativos", () => {
    expect(normalizar(formatCurrency(0))).toBe("$ 0,00");
    expect(normalizar(formatCurrency(-1500))).toBe("-$ 1.500,00");
  });

  test("otra moneda", () => {
    expect(normalizar(formatCurrency(10, "USD"))).toBe("US$ 10,00");
  });
});

describe("formatNumber", () => {
  test("separa miles con punto y no agrega decimales", () => {
    expect(normalizar(formatNumber(1234567))).toBe("1.234.567");
  });

  test("fija la cantidad de decimales cuando se indica", () => {
    expect(normalizar(formatNumber(1234.5, 2))).toBe("1.234,50");
    expect(normalizar(formatNumber(0.1234, 2))).toBe("0,12");
  });
});

describe("formatDate", () => {
  test("usa la hora de Buenos Aires por defecto", () => {
    expect(formatDate("2026-10-14T15:30:00Z")).toBe("14/10/2026");
    // 01:00 UTC del 15 todavía es la noche del 14 en Buenos Aires
    expect(formatDate("2026-10-15T01:00:00Z")).toBe("14/10/2026");
  });

  test("acepta otra zona horaria", () => {
    expect(formatDate("2026-10-15T01:00:00Z", "UTC")).toBe("15/10/2026");
  });

  test("acepta Date y números", () => {
    expect(formatDate(new Date("2026-10-14T15:30:00Z"))).toBe("14/10/2026");
    expect(formatDate(Date.UTC(2026, 9, 14, 15, 30))).toBe("14/10/2026");
  });

  test("devuelve texto vacío si la fecha no es válida", () => {
    expect(formatDate("no es una fecha")).toBe("");
  });
});

describe("formatDateTime", () => {
  test("fecha y hora de Buenos Aires", () => {
    expect(normalizar(formatDateTime("2026-10-14T15:30:00Z"))).toMatch(/^14\/10\/2026,? 12:30$/);
  });

  test("acepta otra zona horaria", () => {
    expect(normalizar(formatDateTime("2026-10-14T15:30:00Z", "UTC"))).toMatch(/^14\/10\/2026,? 15:30$/);
  });

  test("devuelve texto vacío si la fecha no es válida", () => {
    expect(formatDateTime("no es una fecha")).toBe("");
  });
});
