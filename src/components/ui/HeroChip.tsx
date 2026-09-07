import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme/ThemeContext';

interface HeroChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  accentColor?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const HeroChip: React.FC<HeroChipProps> = ({
  label,
  isSelected,
  onPress,
  accentColor,
  size = 'md',
  icon,
  style,
}) => {
  const { theme, isDark } = useAppTheme();
  const activeColor = accentColor || theme.quadrants.blue.color;

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: size === 'sm' ? 9 : 12,
    paddingVertical: size === 'sm' ? 5 : 7,
    borderRadius: size === 'sm' ? 8 : 10,
    borderWidth: 1,
    backgroundColor: isSelected
      ? activeColor
      : isDark
      ? theme.surface
      : theme.surface,
    borderColor: isSelected
      ? activeColor
      : theme.border,
    shadowColor: isSelected ? activeColor : 'transparent',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isSelected ? (isDark ? 0.35 : 0.15) : 0,
    shadowRadius: 4,
    elevation: isSelected ? 2 : 0,
  };

  const textStyle: TextStyle = {
    fontSize: size === 'sm' ? 11 : 12,
    fontWeight: isSelected ? '700' : '500',
    color: isSelected ? '#FFFFFF' : theme.text,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[containerStyle, style]}
    >
      {icon}
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};
