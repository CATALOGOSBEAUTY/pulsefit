import React from 'react';
import { ScrollView, Text } from 'react-native';
import { Button } from '../components/Button';
import { Surface } from '../components/Surface';
import { styles } from '../styles';
import { Colors, Product } from '../types';

interface FavoritesScreenProps {
  storeProducts: Product[];
  favoriteIds: string[];
  onViewProduct: (product: Product) => void;
  colors: Colors;
}

export function FavoritesScreen({ storeProducts, favoriteIds, onViewProduct, colors }: FavoritesScreenProps) {
  const favoriteProducts = storeProducts.filter((p) => favoriteIds.includes(p.id));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Favoritos desta loja</Text>
      {favoriteProducts.length === 0 ? (
        <Text style={{ color: colors.muted }}>Nenhum favorito salvo neste aparelho.</Text>
      ) : (
        favoriteProducts.map((product) => (
          <Surface key={product.id} colors={colors} style={styles.rowCard}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <Button
              label="Ver produto"
              onPress={() => onViewProduct(product)}
              colors={colors}
            />
          </Surface>
        ))
      )}
    </ScrollView>
  );
}
