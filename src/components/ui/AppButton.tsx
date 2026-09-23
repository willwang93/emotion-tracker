import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { AppText } from './AppText';
import { QuadrantType } from '../../types';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'subtle' | 'quadrant';
export type ButtonSize = 'default' | 'small';

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  quadrant?: QuadrantType;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  size = 'default',
  quadrant,
  loading = false,
  icon,
  iconPosition = 'right',
  style,
  textStyle,
  disabled,
  ...rest
}) => {
  const { theme, isDark } = useAppTheme();

  let bgColor = theme.btnPrimaryBg;
  let textColor = theme.btnPrimaryText;
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'primary') {
    bgColor = theme.btnPrimaryBg;
    textColor = theme.btnPrimaryText;
  } else if (variant === 'secondary') {
    bgColor = theme.surfaceContainerHigh;
    textColor = theme.text;
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    textColor = theme.text;
    borderColor = theme.borderFocus;
    borderWidth = 1.5;
  } else if (variant === 'subtle') {
    bgColor = theme.chipBg;
    textColor = theme.textSecondary;
  } else if (variant === 'quadrant' && quadrant) {
    const qToken = theme.quadrants[quadrant];
    bgColor = qToken.color;
    textColor = '#FFFFFF';
  }

  const isSmall = size === 'small';
  const height = isSmall ? 42 : 56;
  const paddingHorizontal = isSmall ? 18 : 24;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        {
          height,
          paddingHorizontal,
          backgroundColor: disabled ? (isDark ? '#2A2E39' : '#E5DFD5') : bgColor,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <AppText
            variant={isSmall ? 'caption' : 'body'}
            bold
            color={textColor}
            style={[styles.btnText, textStyle]}
          >
            {title}
          </AppText>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
