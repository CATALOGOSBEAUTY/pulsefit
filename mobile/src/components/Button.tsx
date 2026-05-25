import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from '../styles';
import { Colors } from '../types';

interface ButtonProps {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
  colors: Colors;
}

export function Button({ label, onPress, tone = 'primary', colors }: ButtonProps) {
  const backgroundColor =
    tone === 'primary' ? colors.primary : tone === 'danger' ? colors.danger : colors.surfaceAlt;
  const color = tone === 'secondary' ? colors.text : '#ffffff';

  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor }]}>
      <Text style={[styles.buttonText, { color }]}>{label}</Text>
    </Pressable>
  );
}
