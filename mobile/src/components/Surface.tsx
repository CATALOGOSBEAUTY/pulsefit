import React from 'react';
import { View } from 'react-native';
import { styles } from '../styles';
import { Colors } from '../types';

interface SurfaceProps {
  children: React.ReactNode;
  style?: object;
  colors: Colors;
}

export function Surface({ children, style, colors }: SurfaceProps) {
  return (
    <View style={[styles.surface, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}
