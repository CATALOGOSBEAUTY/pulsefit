import { normalizeCheckoutMode, type CheckoutMode } from '../catalogConfig/service.js';
import { resolvePlanLimits } from '../clientPlans/service.js';

export type ClientPlanCode = 'basic' | 'medium' | 'master' | 'custom';

export type ClientConfig = {
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  whatsappPhone: string | null;
  checkoutMode: CheckoutMode;
  externalCheckoutUrl: string | null;
  planCode: ClientPlanCode;
  maxProducts: number | null;
  maxCategories: number | null;
  maxSubcategories: number | null;
  isActive: boolean;
};

const PLAN_CODES = new Set<ClientPlanCode>(['basic', 'medium', 'master', 'custom']);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;

function readText(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(input: Record<string, unknown>, key: string): string | null {
  const value = readText(input, key);
  return value || null;
}

function normalizeHexColor(value: string): string {
  return value.toLowerCase();
}

function isHttpsUrl(value: string | null): boolean {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseLimit(input: Record<string, unknown>, key: string, errors: string[]): number | null {
  const value = input[key];
  if (value === null || value === undefined || value === '') return null;

  if (!Number.isInteger(value) || Number(value) < 0) {
    errors.push(`${key} deve ser um inteiro maior ou igual a zero.`);
    return null;
  }

  return Number(value);
}

export function parseClientConfig(rawInput: unknown): ClientConfig {
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    throw new Error('Arquivo de cliente deve conter um objeto JSON.');
  }

  const input = rawInput as Record<string, unknown>;
  const errors: string[] = [];

  const storeName = readText(input, 'storeName');
  if (!storeName) errors.push('storeName e obrigatorio.');

  const storeSlug = readText(input, 'storeSlug').toLowerCase();
  if (!SLUG_PATTERN.test(storeSlug)) {
    errors.push('storeSlug deve conter apenas letras minusculas, numeros e hifens.');
  }

  const primaryColor = normalizeHexColor(readText(input, 'primaryColor'));
  if (!HEX_COLOR_PATTERN.test(primaryColor)) errors.push('primaryColor deve ser uma cor HEX no formato #rrggbb.');

  const secondaryColor = normalizeHexColor(readText(input, 'secondaryColor'));
  if (!HEX_COLOR_PATTERN.test(secondaryColor)) errors.push('secondaryColor deve ser uma cor HEX no formato #rrggbb.');

  const logoUrl = optionalText(input, 'logoUrl');
  if (!isHttpsUrl(logoUrl)) errors.push('logoUrl deve ser uma URL HTTPS valida.');

  const bannerUrl = optionalText(input, 'bannerUrl');
  if (!isHttpsUrl(bannerUrl)) errors.push('bannerUrl deve ser uma URL HTTPS valida.');

  const externalCheckoutUrl = optionalText(input, 'externalCheckoutUrl');
  if (!isHttpsUrl(externalCheckoutUrl)) errors.push('externalCheckoutUrl deve ser uma URL HTTPS valida.');

  const checkoutMode = normalizeCheckoutMode(input.checkoutMode);
  if (checkoutMode !== input.checkoutMode) {
    errors.push('checkoutMode invalido. Use whatsapp, internal_order, external_link ou pix_whatsapp.');
  }

  const planCode = readText(input, 'planCode') as ClientPlanCode;
  if (!PLAN_CODES.has(planCode)) {
    errors.push('planCode invalido. Use basic, medium, master ou custom.');
  }

  const maxProducts = parseLimit(input, 'maxProducts', errors);
  const maxCategories = parseLimit(input, 'maxCategories', errors);
  const maxSubcategories = parseLimit(input, 'maxSubcategories', errors);

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  const limits = resolvePlanLimits(planCode, {
    maxProducts,
    maxCategories,
    maxSubcategories,
  });

  return {
    storeName,
    storeSlug,
    logoUrl,
    bannerUrl,
    primaryColor,
    secondaryColor,
    whatsappPhone: optionalText(input, 'whatsappPhone'),
    checkoutMode,
    externalCheckoutUrl,
    planCode,
    maxProducts: limits.maxProducts,
    maxCategories: limits.maxCategories,
    maxSubcategories: limits.maxSubcategories,
    isActive: input.isActive === undefined ? true : Boolean(input.isActive),
  };
}

export function mapClientConfigToCatalogRow(config: ClientConfig) {
  return {
    id: true,
    store_name: config.storeName,
    store_slug: config.storeSlug,
    logo_url: config.logoUrl,
    banner_url: config.bannerUrl,
    primary_color: config.primaryColor,
    secondary_color: config.secondaryColor,
    whatsapp_phone: config.whatsappPhone,
    checkout_mode: config.checkoutMode,
    external_checkout_url: config.externalCheckoutUrl,
    plan_code: config.planCode,
    max_products: config.maxProducts,
    max_categories: config.maxCategories,
    max_subcategories: config.maxSubcategories,
    is_active: config.isActive,
  };
}

export function safeClientSummary(config: ClientConfig) {
  return {
    storeName: config.storeName,
    storeSlug: config.storeSlug,
    checkoutMode: config.checkoutMode,
    planCode: config.planCode,
    limits: {
      maxProducts: config.maxProducts,
      maxCategories: config.maxCategories,
      maxSubcategories: config.maxSubcategories,
    },
    isActive: config.isActive,
  };
}
