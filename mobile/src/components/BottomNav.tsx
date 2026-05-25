import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';
import { CartItem, Colors, Screen, Store } from '../types';

interface BottomNavProps {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  activeStore: Store | null;
  adminLogged: boolean;
  currentCart: CartItem[];
  colors: Colors;
}

export function BottomNav({
  screen,
  setScreen,
  activeStore,
  adminLogged,
  currentCart,
  colors,
}: BottomNavProps) {
  if (!activeStore || screen === 'entry' || screen === 'admin-login') return null;

  const tabs: Array<[Screen, string]> = adminLogged
    ? [
        ['catalog', 'Loja'],
        ['admin-dashboard', 'Painel'],
        ['admin-products', 'Produtos'],
        ['admin-orders', 'Pedidos'],
        ['admin-settings', 'Config'],
      ]
    : [
        ['catalog', 'Catalogo'],
        ['favorites', 'Favoritos'],
        ['cart', `Carrinho (${currentCart.length})`],
        ['admin-login', 'Dono'],
      ];

  return (
    <View style={[styles.nav, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {tabs.map(([target, label]) => (
        <Pressable key={target} onPress={() => setScreen(target)} style={styles.navItem}>
          <Text
            style={{
              color: screen === target ? colors.primary : colors.muted,
              fontWeight: '700',
              fontSize: 12,
            }}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
