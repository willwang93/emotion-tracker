import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

interface HeroCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  glowColor?: string;
  onPress?: () => void;
  activeOpacity?: number;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  children,
  style,
  glowColor,
  onPress,
  activeOpacity = 0.85,
}) => {
  const { theme, isDark } = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.cardBg,
    borderColor: glowColor ? glowColor : theme.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    shadowColor: glowColor ? glowColor : theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? (glowColor ? 0.3 : 0.2) : (glowColor ? 0.15 : 0.06),
    shadowRadius: glowColor ? 8 : 4,
    elevation: isDark ? (glowColor ? 4 : 2) : 2,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
