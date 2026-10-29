import { describe, expect, it } from "vitest";
import { formatClinicalMemory, type ClinicalMemory } from "@/lib/clinical-memory";

const record = (overrides: Partial<ClinicalMemory> = {}): ClinicalMemory => ({
  id: "memory-1",
  category: "allergy",
  value: "Alergia a penicilina",
  details: { fuente: "paciente", medicamentos: ["amoxicilina"] },
  status: "active",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
  ...overrides,
});

describe("formato de memoria clínica", () => {
  it("returns no context when there are no active confirmed records", () => {
    expect(formatClinicalMemory([])).toBeUndefined();
    expect(formatClinicalMemory([record({ status: "resolved" })])).toBeUndefined();
  });

  it("renders only active records and bounds detail keys and values", () => {
    const longKey = "clave ".repeat(30);
    const longValue = "dato ".repeat(80);
    const text = formatClinicalMemory([
      record(),
      record({ id: "resolved", status: "resolved", value: "No debe aparecer" }),
      record({ id: "long", details: { [longKey]: longValue } }),
    ]);

    expect(text).toContain("categoría: allergy; dato confirmado: Alergia a penicilina");
    expect(text).toContain("fuente: paciente");
    expect(text).not.toContain("No debe aparecer");
    expect(text).not.toContain("\n- categoría: allergy; dato confirmado: No debe aparecer");
    expect(text).not.toContain("\n" + "dato ".repeat(80));
    expect(text!.split("\n")).toHaveLength(2);
  });

  it("serializes structured detail values without leaking newlines", () => {
    const text = formatClinicalMemory(record({ details: { notas: "línea 1\n\n línea 2", activo: true } }));

    expect(text).toContain("notas: línea 1 línea 2");
    expect(text).toContain("activo: true");
  });
});
