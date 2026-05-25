import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Surface } from '../components/Surface';
import { styles } from '../styles';
import { CartItem, Colors, Product, ProductVariant } from '../types';

function currency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type CartDetail = CartItem & {
  product: Product;
  variant?: ProductVariant;
  unitPrice: number;
  total: number;
};

interface CartScreenProps {
  cartDetails: CartDetail[];
  cartTotal: number;
  onUpdateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  onCheckout: () => void;
  colors: Colors;
}

export function CartScreen({ cartDetails, cartTotal, onUpdateQuantity, onCheckout, colors }: CartScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Carrinho persistente</Text>
      {cartDetails.length === 0 ? (
        <Text style={{ color: colors.muted }}>Carrinho vazio.</Text>
      ) : null}
      {cartDetails.map((item) => (
        <Surface key={`${item.productId}-${item.variantId || 'base'}`} colors={colors} style={styles.rowCard}>
          <Text style={[styles.productName, { color: colors.text }]}>{item.product.name}</Text>
          <Text style={{ color: colors.muted }}>
            {item.variant?.label || 'Padrao'} - {currency(item.unitPrice)}
          </Text>
          <View style={styles.qtyRow}>
            <Button
              label="-"
              onPress={() => onUpdateQuantity(item.productId, item.variantId, item.quantity - 1)}
              tone="secondary"
              colors={colors}
            />
            <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
            <Button
              label="+"
              onPress={() => onUpdateQuantity(item.productId, item.variantId, item.quantity + 1)}
              tone="secondary"
              colors={colors}
            />
          </View>
        </Surface>
      ))}
      <Surface colors={colors}>
        <Text style={[styles.priceLarge, { color: colors.primary }]}>Total {currency(cartTotal)}</Text>
        <Text style={[styles.paragraph, { color: colors.muted }]}>
          Precos e estoque sao revalidados pela API antes de criar o pedido.
        </Text>
        <Button label="Continuar para checkout" onPress={onCheckout} colors={colors} />
      </Surface>
    </ScrollView>
  );
}
