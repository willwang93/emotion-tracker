import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme';

export type TextVariant =
  | 'hero'
  | 'heading1'
  | 'heading2'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

export type TextColor = 'primary' | 'secondary' | 'muted' | 'subtle' | 'inverse' | string;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  bold = false,
  style,
  children,
  ...rest
}) => {
  const { theme } = useAppTheme();

  let resolvedColor = theme.text;
  if (color === 'primary') resolvedColor = theme.text;
  else if (color === 'secondary') resolvedColor = theme.textSecondary;
  else if (color === 'muted') resolvedColor = theme.textMuted;
  else if (color === 'subtle') resolvedColor = theme.textSubtle;
  else if (color === 'inverse') resolvedColor = '#FFFFFF';
  else if (color) resolvedColor = color;

  const variantStyle = VARIANT_STYLES[variant];

  return (
    <Text
      style={[
        variantStyle,
        {
          color: resolvedColor,
          textAlign: align,
        },
        bold && { fontFamily: fonts.bold },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const VARIANT_STYLES = StyleSheet.create({
  hero: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heading1: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  heading2: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
