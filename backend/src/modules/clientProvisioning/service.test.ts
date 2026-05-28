import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  mapClientConfigToCatalogRow,
  parseClientConfig,
  safeClientSummary,
} from './service.js';

describe('client provisioning service', () => {
  it('normalizes a valid client config template', () => {
    const config = parseClientConfig({
      storeName: ' Bella Fit ',
      storeSlug: 'bella-fit',
      logoUrl: 'https://cdn.example.com/logo.png',
      bannerUrl: 'https://cdn.example.com/banner.png',
      primaryColor: '#E91E63',
      secondaryColor: '#111827',
      whatsappPhone: ' 5511999999999 ',
      checkoutMode: 'whatsapp',
      planCode: 'basic',
      maxProducts: 80,
      maxCategories: 8,
      maxSubcategories: 30,
      isActive: true,
    });

    assert.deepEqual(config, {
      storeName: 'Bella Fit',
      storeSlug: 'bella-fit',
      logoUrl: 'https://cdn.example.com/logo.png',
      bannerUrl: 'https://cdn.example.com/banner.png',
      primaryColor: '#e91e63',
      secondaryColor: '#111827',
      whatsappPhone: '5511999999999',
      checkoutMode: 'whatsapp',
      externalCheckoutUrl: null,
      planCode: 'basic',
      maxProducts: 80,
      maxCategories: 8,
      maxSubcategories: 30,
      isActive: true,
    });
  });

  it('maps a client config to the catalog_config database row', () => {
    const config = parseClientConfig({
      storeName: 'Bella Fit',
      storeSlug: 'bella-fit',
      primaryColor: '#e91e63',
      secondaryColor: '#111827',
      checkoutMode: 'external_link',
      externalCheckoutUrl: 'https://checkout.example.com/bella-fit',
      planCode: 'custom',
      maxProducts: null,
      maxCategories: 12,
      maxSubcategories: 48,
      isActive: false,
    });

    assert.deepEqual(mapClientConfigToCatalogRow(config), {
      id: true,
      store_name: 'Bella Fit',
      store_slug: 'bella-fit',
      logo_url: null,
      banner_url: null,
      primary_color: '#e91e63',
      secondary_color: '#111827',
      whatsapp_phone: null,
      checkout_mode: 'external_link',
      external_checkout_url: 'https://checkout.example.com/bella-fit',
      plan_code: 'custom',
      max_products: null,
      max_categories: 12,
      max_subcategories: 48,
      is_active: false,
    });
  });

  it('rejects unsafe or invalid template values before writing to Supabase', () => {
    assert.throws(
      () => parseClientConfig({
        storeName: '',
        storeSlug: 'Cliente Inválido',
        primaryColor: 'green',
        secondaryColor: '#111827',
        checkoutMode: 'card',
        planCode: 'enterprise',
        maxProducts: -1,
        maxCategories: 2.5,
        maxSubcategories: 3,
      }),
      /storeName e obrigatorio.*storeSlug deve conter.*primaryColor deve ser uma cor HEX.*checkoutMode invalido.*planCode invalido.*maxProducts deve ser.*maxCategories deve ser/s
    );
  });

  it('does not include secret or raw environment data in the summary', () => {
    const config = parseClientConfig({
      storeName: 'Bella Fit',
      storeSlug: 'bella-fit',
      primaryColor: '#e91e63',
      secondaryColor: '#111827',
      checkoutMode: 'whatsapp',
      planCode: 'basic',
      maxProducts: 80,
      maxCategories: 8,
      maxSubcategories: 30,
    });

    assert.deepEqual(safeClientSummary(config), {
      storeName: 'Bella Fit',
      storeSlug: 'bella-fit',
      checkoutMode: 'whatsapp',
      planCode: 'basic',
      limits: {
        maxProducts: 80,
        maxCategories: 8,
        maxSubcategories: 30,
      },
      isActive: true,
    });
  });
});
