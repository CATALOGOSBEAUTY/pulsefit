import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getClientPlan,
  listClientPlans,
  resolvePlanLimits,
} from './service.js';

describe('client plans service', () => {
  it('defines the three commercial catalog plans from the pricing table', () => {
    assert.deepEqual(listClientPlans().map((plan) => ({
      code: plan.code,
      name: plan.name,
      monthlyPriceCents: plan.monthlyPriceCents,
      loyaltyMonths: plan.loyaltyMonths,
      maxProducts: plan.limits.maxProducts,
      maxCategories: plan.limits.maxCategories,
      maxSubcategories: plan.limits.maxSubcategories,
      hasAdminCenter: plan.features.adminCenter,
    })), [
      {
        code: 'basic',
        name: 'Plano 1',
        monthlyPriceCents: 4990,
        loyaltyMonths: 3,
        maxProducts: 50,
        maxCategories: null,
        maxSubcategories: null,
        hasAdminCenter: false,
      },
      {
        code: 'medium',
        name: 'Plano 2',
        monthlyPriceCents: 39990,
        loyaltyMonths: 6,
        maxProducts: 250,
        maxCategories: 10,
        maxSubcategories: 5,
        hasAdminCenter: true,
      },
      {
        code: 'master',
        name: 'Plano 3',
        monthlyPriceCents: 74990,
        loyaltyMonths: 6,
        maxProducts: 450,
        maxCategories: 20,
        maxSubcategories: 20,
        hasAdminCenter: true,
      },
    ]);
  });

  it('returns a defensive copy of a plan definition', () => {
    const plan = getClientPlan('medium');
    assert.equal(plan.code, 'medium');

    plan.features.adminCenter = false;

    assert.equal(getClientPlan('medium').features.adminCenter, true);
  });

  it('uses plan limits unless the config is custom', () => {
    assert.deepEqual(resolvePlanLimits('medium', {
      maxProducts: 999,
      maxCategories: 999,
      maxSubcategories: 999,
    }), {
      maxProducts: 250,
      maxCategories: 10,
      maxSubcategories: 5,
    });

    assert.deepEqual(resolvePlanLimits('custom', {
      maxProducts: 999,
      maxCategories: 12,
      maxSubcategories: 48,
    }), {
      maxProducts: 999,
      maxCategories: 12,
      maxSubcategories: 48,
    });
  });
});
