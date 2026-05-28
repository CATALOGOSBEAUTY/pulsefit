import type { ClientPlanCode } from '../clientProvisioning/service.js';

export type ClientPlanLimits = {
  maxProducts: number | null;
  maxCategories: number | null;
  maxSubcategories: number | null;
};

export type ClientPlanFeatures = {
  adminCenter: boolean;
  stockAndDemand: boolean;
  financialManagement: boolean;
  paymentAccountIntegration: boolean;
  onlineSales: boolean;
  shippingIntegration: boolean;
  support: 'none' | 'queue' | 'priority';
  checkoutMode: 'whatsapp';
  photosVisit: 'on_request';
};

export type ClientPlanDefinition = {
  code: Exclude<ClientPlanCode, 'custom'>;
  name: string;
  label: string;
  monthlyPriceCents: number;
  loyaltyMonths: number;
  limits: ClientPlanLimits;
  features: ClientPlanFeatures;
};

const CLIENT_PLANS: ClientPlanDefinition[] = [
  {
    code: 'basic',
    name: 'Plano 1',
    label: 'Catalogo com 50 produtos',
    monthlyPriceCents: 4_990,
    loyaltyMonths: 3,
    limits: {
      maxProducts: 50,
      maxCategories: null,
      maxSubcategories: null,
    },
    features: {
      adminCenter: false,
      stockAndDemand: false,
      financialManagement: false,
      paymentAccountIntegration: false,
      onlineSales: false,
      shippingIntegration: false,
      support: 'none',
      checkoutMode: 'whatsapp',
      photosVisit: 'on_request',
    },
  },
  {
    code: 'medium',
    name: 'Plano 2',
    label: 'Catalogo com 250 produtos',
    monthlyPriceCents: 39_990,
    loyaltyMonths: 6,
    limits: {
      maxProducts: 250,
      maxCategories: 10,
      maxSubcategories: 5,
    },
    features: {
      adminCenter: true,
      stockAndDemand: true,
      financialManagement: false,
      paymentAccountIntegration: false,
      onlineSales: false,
      shippingIntegration: false,
      support: 'queue',
      checkoutMode: 'whatsapp',
      photosVisit: 'on_request',
    },
  },
  {
    code: 'master',
    name: 'Plano 3',
    label: 'Catalogo com 450 produtos ou mais',
    monthlyPriceCents: 74_990,
    loyaltyMonths: 6,
    limits: {
      maxProducts: 450,
      maxCategories: 20,
      maxSubcategories: 20,
    },
    features: {
      adminCenter: true,
      stockAndDemand: true,
      financialManagement: true,
      paymentAccountIntegration: true,
      onlineSales: true,
      shippingIntegration: true,
      support: 'priority',
      checkoutMode: 'whatsapp',
      photosVisit: 'on_request',
    },
  },
];

function clonePlan(plan: ClientPlanDefinition): ClientPlanDefinition {
  return {
    ...plan,
    limits: { ...plan.limits },
    features: { ...plan.features },
  };
}

export function listClientPlans(): ClientPlanDefinition[] {
  return CLIENT_PLANS.map(clonePlan);
}

export function getClientPlan(code: Exclude<ClientPlanCode, 'custom'>): ClientPlanDefinition {
  const plan = CLIENT_PLANS.find((item) => item.code === code);
  if (!plan) throw new Error(`Plano nao encontrado: ${code}`);
  return clonePlan(plan);
}

export function resolvePlanLimits(
  planCode: ClientPlanCode,
  customLimits: ClientPlanLimits
): ClientPlanLimits {
  if (planCode === 'custom') return { ...customLimits };
  return { ...getClientPlan(planCode).limits };
}
