import type { PriceVariationReference } from "@/lib/price-variation-data";

export type CalculatorValues = {
  workValue: number;
  base: Record<string, number>;
  current: Record<string, number>;
};

export type CalculatorResult = {
  factor: number;
  adjustment: number;
  components: { label: string; coefficient: number; base: number; current: number; ratio: number; contribution: number }[];
};

export function calculateNhaiOrVii2008(reference: PriceVariationReference, values: CalculatorValues): CalculatorResult {
  if (reference.calculatorId !== "nhai-or-vii-2008") throw new Error("No calculation function is available for this formula.");
  if (!Number.isFinite(values.workValue) || values.workValue < 0) throw new Error("Enter a valid, non-negative value of work for the period.");

  const components = reference.components.map((component) => {
    const base = values.base[component.key];
    const current = values.current[component.key];
    if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(current) || current < 0) {
      throw new Error(`Enter a positive base value and a non-negative current value for ${component.label.toLowerCase()}.`);
    }
    const ratio = current / base;
    return { label: component.label, coefficient: component.coefficient, base, current, ratio, contribution: component.coefficient * ratio };
  });

  const factor = reference.fixedComponent + components.reduce((total, component) => total + component.contribution, 0);
  return { factor, adjustment: (factor - 1) * values.workValue, components };
}

export function calculateSailCivil2024(reference: PriceVariationReference, values: CalculatorValues): CalculatorResult {
  if (reference.calculatorId !== "sail-sbd-2024-civil") throw new Error("This calculation function only supports the SAIL SBD 2024 civil works formula.");
  if (!Number.isFinite(values.workValue) || values.workValue <= 0) throw new Error("Enter a positive original price P₀, excluding taxes and duties.");

  const components = reference.components.map((component) => {
    const base = values.base[component.key];
    const current = values.current[component.key];
    if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(current) || current <= 0) {
      throw new Error(`Enter positive Base Date and current values for ${component.label.toLowerCase()}.`);
    }
    const ratio = current / base;
    return { label: component.label, coefficient: component.coefficient, base, current, ratio, contribution: component.coefficient * ratio };
  });

  const factor = reference.fixedComponent + components.reduce((total, component) => total + component.contribution, 0);
  return { factor, adjustment: (factor - 1) * values.workValue, components };
}
