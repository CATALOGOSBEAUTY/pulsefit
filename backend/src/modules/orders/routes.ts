import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { ApiError, handleError, ok, optionalString, requireNumber, requireString } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const orderRouter = Router();

interface NormalizedOrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

function formatWhatsAppMessage(order: any, items: any[]) {
  let message = '*NOVO PEDIDO - CATALOGO FITNESS*\\n\\n';
  message += '*DADOS DO CLIENTE*\\n';
  message += `Nome: ${order.customer_name}\\n`;
  message += `Endereco: ${order.address}, ${order.number}${order.complement ? ` - ${order.complement}` : ''}\\n`;
  message += `Bairro: ${order.neighborhood}\\n`;
  message += `Regiao: ${order.region}\\n`;
  message += `CEP: ${order.cep}\\n\\n`;
  message += 'Ola, tenho interesse nos produtos abaixo que vi no catalogo fitness:\\n\\n';

  items.forEach((item) => {
    message += `- ${item.quantity}x ${item.product_name} - R$ ${Number(item.subtotal).toFixed(2)}\\n`;
  });

  message += `\\n*TOTAL DO PEDIDO: R$ ${Number(order.total_amount).toFixed(2)}*\\n\\n`;
  message += 'Aguardando a confirmacao e instrucoes de pagamento.';
  return message;
}

async function getPublicSetting(key: string): Promise<string> {
  const { data, error } = await getSupabaseAdmin().from('settings').select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return data?.value ?? '';
}

orderRouter.post('/', async (req, res) => {
  try {
    const customer = req.body.customer ?? req.body;
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (items.length === 0) throw new ApiError(400, 'Pedido sem itens.');

    const productIds = items.map((item: any) => requireString(item.productId ?? item.product?.id, 'productId'));
    const { data: products, error: productsError } = await getSupabaseAdmin()
      .from('products')
      .select('id,title,price,is_active')
      .in('id', productIds)
      .eq('is_active', true);

    if (productsError) throw productsError;
    if (!products || products.length !== productIds.length) {
      throw new ApiError(400, 'Um ou mais produtos nao estao disponiveis.');
    }

    const normalizedItems: NormalizedOrderItem[] = items.map((item: any) => {
      const productId = requireString(item.productId ?? item.product?.id, 'productId');
      const product = products.find((entry) => entry.id === productId);
      if (!product) throw new ApiError(400, 'Produto indisponivel.');
      const quantity = Math.max(1, Math.floor(requireNumber(item.quantity, 'quantity')));
      const subtotal = Number(product.price) * quantity;

      return {
        product_id: product.id,
        product_name: product.title,
        unit_price: Number(product.price),
        quantity,
        subtotal,
      };
    });

    const total = normalizedItems.reduce((sum: number, item: NormalizedOrderItem) => sum + item.subtotal, 0);
    const orderPayload = {
      customer_name: requireString(customer.fullName ?? customer.customer_name, 'fullName'),
      customer_phone: optionalString(customer.phone ?? customer.customer_phone),
      cep: requireString(customer.cep, 'cep'),
      address: requireString(customer.address, 'address'),
      number: requireString(customer.number, 'number'),
      complement: optionalString(customer.complement),
      neighborhood: requireString(customer.neighborhood, 'neighborhood'),
      region: requireString(customer.region, 'region'),
      total_amount: total,
      status: 'new',
    };

    const supabase = getSupabaseAdmin();
    const { data: order, error: orderError } = await supabase.from('orders').insert(orderPayload).select('*').single();
    if (orderError) throw orderError;

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(normalizedItems.map((item: NormalizedOrderItem) => ({ ...item, order_id: order.id })))
      .select('*');

    if (itemsError) throw itemsError;

    const phone = await getPublicSetting('whatsapp_phone');
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(formatWhatsAppMessage(order, createdItems ?? []))}`
      : '';

    return ok(res, { order, items: createdItems ?? [], whatsappUrl }, 201);
  } catch (error) {
    return handleError(res, error);
  }
});

orderRouter.get('/', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, data ?? []);
  } catch (error) {
    return handleError(res, error);
  }
});
