import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { AppText } from './AppText';
import { QuadrantType } from '../../types';

export interface AppChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  quadrant?: QuadrantType | null;
  icon?: React.ReactNode;
  size?: 'default' | 'small';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppChip: React.FC<AppChipProps> = ({
  label,
  selected = false,
  onPress,
  quadrant,
  icon,
  size = 'default',
  style,
  textStyle,
}) => {
  const { theme } = useAppTheme();

  let bgColor = '#FFFFFF';
  let textColor = theme.text;
  let borderColor = theme.borderMuted;

  if (selected) {
    if (quadrant) {
      const qToken = theme.quadrants[quadrant];
      bgColor = qToken.selectedChipBg;
      textColor = qToken.selectedChipText;
      borderColor = qToken.selectedChipBorder === 'transparent' ? 'transparent' : qToken.selectedChipBorder;
    } else {
      bgColor = theme.btnPrimaryBg;
      textColor = theme.btnPrimaryText;
      borderColor = 'transparent';
    }
  }

  const isSmall = size === 'small';
  const paddingVertical = isSmall ? 8 : 12;
  const paddingHorizontal = isSmall ? 14 : 18;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chipBase,
        {
          backgroundColor: bgColor,
          borderColor,
          paddingVertical,
          paddingHorizontal,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <AppText
        variant={isSmall ? 'caption' : 'body'}
        bold={selected}
        color={textColor}
        style={textStyle}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipBase: {
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 6,
  },
});
