import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { styles } from '../styles';
import { CheckoutProfile, Colors } from '../types';

interface CheckoutScreenProps {
  checkoutProfile: CheckoutProfile;
  setCheckoutProfile: (updater: (prev: CheckoutProfile) => CheckoutProfile) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
  colors: Colors;
}

const FIELD_LABELS: Record<keyof Omit<CheckoutProfile, 'paymentMethod'>, string> = {
  name: 'Nome',
  phone: 'Telefone',
  address: 'Endereco/bairro',
  note: 'Observacao',
};

export function CheckoutScreen({
  checkoutProfile,
  setCheckoutProfile,
  onSubmit,
  onReset,
  isLoading,
  colors,
}: CheckoutScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Checkout via WhatsApp</Text>
      {(['name', 'phone', 'address', 'note'] as const).map((field) => (
        <TextInput
          key={field}
          value={checkoutProfile[field]}
          onChangeText={(value) => setCheckoutProfile((current) => ({ ...current, [field]: value }))}
          placeholder={FIELD_LABELS[field]}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
      ))}
      <View style={styles.chips}>
        {(['Pix a combinar', 'Presencial'] as const).map((method) => (
          <Pressable
            key={method}
            onPress={() => setCheckoutProfile((current) => ({ ...current, paymentMethod: method }))}
            style={[
              styles.chip,
              {
                borderColor: checkoutProfile.paymentMethod === method ? colors.primary : colors.border,
                backgroundColor:
                  checkoutProfile.paymentMethod === method ? colors.surfaceAlt : 'transparent',
              },
            ]}
          >
            <Text style={{ color: colors.text }}>{method}</Text>
          </Pressable>
        ))}
      </View>
      <Button
        label={isLoading ? 'Salvando...' : 'Salvar pedido e abrir WhatsApp'}
        onPress={onSubmit}
        colors={colors}
      />
      <Button label="Limpar meus dados salvos" tone="danger" onPress={onReset} colors={colors} />
    </ScrollView>
  );
}
