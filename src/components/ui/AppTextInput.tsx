import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme';
import { AppText } from './AppText';

export interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  placeholderTextColor,
  style,
  ...rest
}) => {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <AppText variant="caption" color="secondary" bold style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        placeholderTextColor={placeholderTextColor || theme.textMuted}
        style={[
          styles.inputBase,
          {
            backgroundColor: theme.inputBg,
            borderColor: error ? theme.quadrants.red.color : theme.inputBorder,
            color: theme.text,
          },
          inputStyle,
          style,
        ]}
        {...rest}
      />
      {error && (
        <AppText variant="caption" color={theme.quadrants.red.textColor} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  inputBase: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  errorText: {
    marginTop: 6,
  },
});
