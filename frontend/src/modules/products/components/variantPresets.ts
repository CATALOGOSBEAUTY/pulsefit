import type { ProductVariant } from "../store/useProductStore";

export type VariationPresetId =
  | "clothing-size"
  | "shoe-size"
  | "pants-size"
  | "color"
  | "flavor"
  | "voltage"
  | "model"
  | "custom";

export interface VariationPreset {
  id: VariationPresetId;
  label: string;
  optionName: string;
  placeholderValue: string;
  placeholderLabel: string;
  values: string[];
}

export const VARIATION_PRESETS: VariationPreset[] = [
  {
    id: "clothing-size",
    label: "Tamanho roupa",
    optionName: "Tamanho",
    placeholderValue: "M",
    placeholderLabel: "Tamanho: M",
    values: ["PP", "P", "M", "G", "GG", "XG", "XXG"],
  },
  {
    id: "shoe-size",
    label: "Tamanho tenis",
    optionName: "Tamanho tenis",
    placeholderValue: "38",
    placeholderLabel: "Tamanho tenis: 38",
    values: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  },
  {
    id: "pants-size",
    label: "Tamanho calca",
    optionName: "Tamanho calca",
    placeholderValue: "38",
    placeholderLabel: "Tamanho calca: 38",
    values: ["34", "36", "38", "40", "42", "44", "46", "48"],
  },
  {
    id: "color",
    label: "Cor",
    optionName: "Cor",
    placeholderValue: "Preto",
    placeholderLabel: "Cor: Preto",
    values: ["Preto", "Branco", "Cinza", "Rosa", "Azul", "Verde"],
  },
  {
    id: "flavor",
    label: "Sabor",
    optionName: "Sabor",
    placeholderValue: "Chocolate",
    placeholderLabel: "Sabor: Chocolate",
    values: ["Chocolate", "Baunilha", "Morango", "Cookies"],
  },
  {
    id: "voltage",
    label: "Voltagem",
    optionName: "Voltagem",
    placeholderValue: "110V",
    placeholderLabel: "Voltagem: 110V",
    values: ["110V", "220V", "Bivolt"],
  },
  {
    id: "model",
    label: "Modelo",
    optionName: "Modelo",
    placeholderValue: "Premium",
    placeholderLabel: "Modelo: Premium",
    values: ["Basico", "Premium", "Pro"],
  },
  {
    id: "custom",
    label: "Personalizado",
    optionName: "Tipo",
    placeholderValue: "Valor",
    placeholderLabel: "Tipo: Valor",
    values: [],
  },
];

export function getVariationPreset(id: VariationPresetId) {
  return VARIATION_PRESETS.find((preset) => preset.id === id) ?? VARIATION_PRESETS[0];
}

export function inferPresetIdFromVariants(variants: ProductVariant[] | undefined): VariationPresetId {
  const firstOptionName = variants?.find((variant) => variant.options?.[0]?.name)?.options[0]?.name?.toLowerCase() ?? "";

  if (firstOptionName.includes("tenis")) return "shoe-size";
  if (firstOptionName.includes("calca") || firstOptionName.includes("pants")) return "pants-size";
  if (firstOptionName.includes("cor")) return "color";
  if (firstOptionName.includes("sabor")) return "flavor";
  if (firstOptionName.includes("voltagem")) return "voltage";
  if (firstOptionName.includes("modelo")) return "model";
  if (firstOptionName.includes("tamanho")) return "clothing-size";

  return "clothing-size";
}

export function createVariantFromPreset(presetId: VariationPresetId, value = ""): ProductVariant {
  const preset = getVariationPreset(presetId);
  const optionValue = value.trim();
  const optionName = preset.optionName;

  return {
    label: optionValue ? `${optionName}: ${optionValue}` : "",
    sku: "",
    options: [{ name: optionName, value: optionValue }],
    price: null,
    stockQuantity: 0,
    isActive: true,
  };
}
