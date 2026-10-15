import { describe, expect, test } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  test("une clases y descarta valores falsos", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  test("acepta arreglos y objetos como clsx", () => {
    expect(cn(["a", { b: true, c: false }])).toBe("a b");
  });

  test("resuelve conflictos de Tailwind: gana la última clase", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  test("mantiene las clases que no entran en conflicto", () => {
    expect(cn("p-2", "mt-4")).toBe("p-2 mt-4");
  });
});
