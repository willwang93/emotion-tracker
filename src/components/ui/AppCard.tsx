import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { QuadrantType } from '../../types';

export type CardVariant = 'surface' | 'container' | 'quadrant';

export interface AppCardProps extends ViewProps {
  variant?: CardVariant;
  quadrant?: QuadrantType;
  padding?: number;
  elevated?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({
  variant = 'surface',
  quadrant,
  padding = 20,
  elevated = true,
  style,
  children,
  ...rest
}) => {
  const { theme, isDark } = useAppTheme();

  let bgColor = theme.cardBg;
  let borderColor = theme.cardBorder;

  if (variant === 'surface') {
    bgColor = theme.cardBg;
    borderColor = theme.cardBorder;
  } else if (variant === 'container') {
    bgColor = theme.surfaceContainer;
    borderColor = theme.borderMuted;
  } else if (variant === 'quadrant' && quadrant) {
    const qToken = theme.quadrants[quadrant];
    bgColor = qToken.cardBg;
    borderColor = qToken.cardBorder;
  }

  return (
    <View
      style={[
        styles.cardBase,
        {
          backgroundColor: bgColor,
          borderColor,
          padding,
        },
        elevated && {
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 16,
          elevation: 2,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
