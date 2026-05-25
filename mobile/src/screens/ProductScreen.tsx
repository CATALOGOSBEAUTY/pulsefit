import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Surface } from '../components/Surface';
import { styles } from '../styles';
import { Colors, Product, ProductVariant } from '../types';

function currency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface ProductScreenProps {
  selectedProduct: Product | null;
  selectedVariantId: string | undefined;
  setSelectedVariantId: (id: string) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onBack: () => void;
  colors: Colors;
}

export function ProductScreen({
  selectedProduct,
  selectedVariantId,
  setSelectedVariantId,
  onAddToCart,
  onBack,
  colors,
}: ProductScreenProps) {
  if (!selectedProduct) {
    return null;
  }

  const selectedVariant = selectedProduct.variants.find((v) => v.id === selectedVariantId);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Image source={{ uri: selectedProduct.imageUrl }} style={styles.detailImage} />
      <Surface colors={colors}>
        <Text style={[styles.title, { color: colors.text }]}>{selectedProduct.name}</Text>
        <Text style={[styles.paragraph, { color: colors.muted }]}>{selectedProduct.description}</Text>
        <Text style={[styles.priceLarge, { color: colors.primary }]}>
          {currency(selectedVariant?.price || selectedProduct.promoPrice || selectedProduct.price)}
        </Text>
        <Text style={[styles.label, { color: colors.text }]}>Variacoes</Text>
        <View style={styles.chips}>
          {selectedProduct.variants.map((variant: ProductVariant) => (
            <Pressable
              key={variant.id}
              onPress={() => setSelectedVariantId(variant.id)}
              style={[
                styles.chip,
                {
                  borderColor: selectedVariantId === variant.id ? colors.primary : colors.border,
                  backgroundColor: selectedVariantId === variant.id ? colors.surfaceAlt : 'transparent',
                },
              ]}
            >
              <Text style={{ color: colors.text }}>{variant.label}</Text>
            </Pressable>
          ))}
        </View>
        <Button
          label="Adicionar ao carrinho"
          onPress={() => onAddToCart(selectedProduct, selectedVariantId)}
          colors={colors}
        />
        <Button label="Voltar ao catalogo" onPress={onBack} tone="secondary" colors={colors} />
      </Surface>
    </ScrollView>
  );
}
