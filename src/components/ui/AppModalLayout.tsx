import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import { AppText } from './AppText';

export interface AppModalLayoutProps {
  title?: string;
  onClose?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
}

export const AppModalLayout: React.FC<AppModalLayoutProps> = ({
  title,
  onClose,
  onBack,
  children,
  footer,
  scrollable = true,
  contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.navButton}
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}

        {title ? (
          <AppText variant="heading2" align="center" style={styles.headerTitle}>
            {title}
          </AppText>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {onClose ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.navButton}
            accessibilityLabel="Close"
          >
            <MaterialIcons name="close" size={24} color={theme.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}
      </View>

      {/* Main Content Area */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentPadding, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentPadding, { flex: 1 }, contentContainerStyle]}>
          {children}
        </View>
      )}

      {/* Fixed Sticky Footer / Action Bar */}
      {footer && <View style={styles.footerContainer}>{footer}</View>}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
