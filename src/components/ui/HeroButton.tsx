import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme/ThemeContext';

interface HeroButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'bordered' | 'flat' | 'ghost';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const HeroButton: React.FC<HeroButtonProps> = ({
  title,
  onPress,
  variant = 'solid',
  color,
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme, isDark } = useAppTheme();
  const activeColor = color || (isDark ? '#F4F4F5' : '#0F172A');

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.selectionAsync();
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    const heights = { sm: 36, md: 46, lg: 52 };
    const paddings = { sm: 12, md: 16, lg: 20 };
    const radii = { sm: 10, md: 14, lg: 16 };

    const base: ViewStyle = {
      height: heights[size],
      paddingHorizontal: paddings[size],
      borderRadius: radii[size],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      opacity: disabled ? 0.45 : 1,
    };

    if (variant === 'solid') {
      return {
        ...base,
        backgroundColor: activeColor,
        shadowColor: activeColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.35 : 0.15,
        shadowRadius: 6,
        elevation: 3,
      };
    }

    if (variant === 'bordered') {
      return {
        ...base,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: activeColor,
      };
    }

    if (variant === 'flat') {
      return {
        ...base,
        backgroundColor: isDark ? theme.surfaceSecondary : theme.surfaceSecondary,
        borderWidth: 1,
        borderColor: theme.border,
      };
    }

    // ghost
    return {
      ...base,
      backgroundColor: 'transparent',
    };
  };

  const getTextStyle = (): TextStyle => {
    const fontSizes = { sm: 12, md: 13, lg: 15 };

    const base: TextStyle = {
      fontSize: fontSizes[size],
      fontWeight: '700',
      letterSpacing: 0.3,
    };

    if (variant === 'solid') {
      return {
        ...base,
        color: '#FFFFFF',
      };
    }

    if (variant === 'bordered' || variant === 'ghost') {
      return {
        ...base,
        color: activeColor,
      };
    }

    // flat
    return {
      ...base,
      color: theme.text,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? '#FFFFFF' : activeColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
