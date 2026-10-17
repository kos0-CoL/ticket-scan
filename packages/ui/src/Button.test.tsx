// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("muestra su texto y es un botón accesible", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy();
  });

  test("por defecto es de tipo button, primary y md", () => {
    render(<Button>Guardar</Button>);
    const boton = screen.getByRole("button", { name: "Guardar" });
    expect(boton.getAttribute("type")).toBe("button");
    expect(boton.dataset.variant).toBe("primary");
    expect(boton.dataset.size).toBe("md");
  });

  test.each(["primary", "secondary", "ghost", "danger", "float"] as const)(
    "acepta la variante %s",
    (variant) => {
      render(<Button variant={variant}>Ok</Button>);
      expect(screen.getByRole("button", { name: "Ok" }).dataset.variant).toBe(variant);
    },
  );

  test.each(["sm", "md", "lg"] as const)("acepta el tamaño %s", (size) => {
    render(<Button size={size}>Ok</Button>);
    expect(screen.getByRole("button", { name: "Ok" }).dataset.size).toBe(size);
  });

  test("llama a onClick al hacer clic", async () => {
    const usuario = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ok</Button>);
    await usuario.click(screen.getByRole("button", { name: "Ok" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("deshabilitado no llama a onClick", async () => {
    const usuario = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Ok
      </Button>,
    );
    const boton = screen.getByRole("button", { name: "Ok" });
    expect((boton as HTMLButtonElement).disabled).toBe(true);
    await usuario.click(boton);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("cargando: se deshabilita, marca aria-busy y no llama a onClick", async () => {
    const usuario = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Guardar
      </Button>,
    );
    const boton = screen.getByRole("button", { name: "Guardar" });
    expect((boton as HTMLButtonElement).disabled).toBe(true);
    expect(boton.getAttribute("aria-busy")).toBe("true");
    await usuario.click(boton);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("sin loading no tiene aria-busy", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" }).hasAttribute("aria-busy")).toBe(false);
  });

  test("fullWidth queda marcado en el botón", () => {
    render(<Button fullWidth>Ok</Button>);
    expect(screen.getByRole("button", { name: "Ok" }).dataset.fullWidth).toBe("true");
  });

  test("muestra los iconos de inicio y de fin", () => {
    render(
      <Button startIcon={<svg data-testid="inicio" />} endIcon={<svg data-testid="fin" />}>
        Ok
      </Button>,
    );
    expect(screen.getByTestId("inicio")).toBeTruthy();
    expect(screen.getByTestId("fin")).toBeTruthy();
  });

  test("cargando reemplaza el icono de inicio", () => {
    render(
      <Button loading startIcon={<svg data-testid="inicio" />}>
        Ok
      </Button>,
    );
    expect(screen.queryByTestId("inicio")).toBeNull();
  });

  test("el botón de solo icono se nombra con aria-label", () => {
    render(
      <Button size="icon" aria-label="Cerrar">
        <svg data-testid="equis" />
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
  });

  test("pasa el resto de atributos y suma la clase recibida", () => {
    render(
      <Button type="submit" data-id="guardar" className="extra">
        Ok
      </Button>,
    );
    const boton = screen.getByRole("button", { name: "Ok" });
    expect(boton.getAttribute("type")).toBe("submit");
    expect(boton.getAttribute("data-id")).toBe("guardar");
    expect(boton.className).toContain("extra");
  });

  test("la clase recibida se suma a las del componente y no las reemplaza", () => {
    const { unmount } = render(<Button>Base</Button>);
    const base = screen.getByRole("button", { name: "Base" }).className;
    unmount();
    render(<Button className="extra">Con extra</Button>);
    const conExtra = screen.getByRole("button", { name: "Con extra" }).className;
    expect(conExtra).toBe(`${base} extra`.trim());
  });

  test("cargando se deshabilita aunque disabled sea false", () => {
    render(
      <Button loading disabled={false}>
        Guardar
      </Button>,
    );
    expect((screen.getByRole("button", { name: "Guardar" }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("el tipo exige aria-label cuando el tamaño es icon", () => {
    // @ts-expect-error un botón de solo icono sin aria-label no debe compilar
    const elemento = <Button size="icon">x</Button>;
    expect(elemento).toBeTruthy();
  });
});
