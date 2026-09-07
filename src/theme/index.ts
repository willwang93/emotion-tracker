import { QuadrantType } from '../types';

export interface QuadrantColorSet {
  color: string;
  subtleBg: string;
  activeBorder: string;
  textColor: string;
  glow: string;
}

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  border: string;
  borderMuted: string;
  borderFocus: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textSubtle: string;
  inputBg: string;
  inputBorder: string;
  cardBg: string;
  cardBorder: string;
  divider: string;
  shadowColor: string;
  statusBar: 'light' | 'dark';
  quadrants: Record<QuadrantType, QuadrantColorSet>;
}

export const typography = {
  serif: 'serif',
  mono: 'monospace',
};

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#090D16',
  surface: '#111827',
  surfaceSecondary: '#1F2937',
  surfaceElevated: '#1F2937',
  border: '#1F2937',
  borderMuted: '#161F2E',
  borderFocus: '#374151',
  text: '#F3F4F6',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textSubtle: '#6B7280',
  inputBg: '#111827',
  inputBorder: '#1F2937',
  cardBg: '#111827',
  cardBorder: '#1F2937',
  divider: 'rgba(255, 255, 255, 0.07)',
  shadowColor: '#000000',
  statusBar: 'light',
  quadrants: {
    red: {
      color: '#EF4444',
      subtleBg: 'rgba(239, 68, 68, 0.12)',
      activeBorder: '#EF4444',
      textColor: '#FCA5A5',
      glow: 'rgba(239, 68, 68, 0.25)',
    },
    yellow: {
      color: '#F59E0B',
      subtleBg: 'rgba(245, 158, 11, 0.12)',
      activeBorder: '#F59E0B',
      textColor: '#FCD34D',
      glow: 'rgba(245, 158, 11, 0.25)',
    },
    blue: {
      color: '#3B82F6',
      subtleBg: 'rgba(59, 130, 246, 0.12)',
      activeBorder: '#3B82F6',
      textColor: '#93C5FD',
      glow: 'rgba(59, 130, 246, 0.25)',
    },
    green: {
      color: '#10B981',
      subtleBg: 'rgba(16, 185, 129, 0.12)',
      activeBorder: '#10B981',
      textColor: '#6EE7B7',
      glow: 'rgba(16, 185, 129, 0.25)',
    },
  },
};

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#FDFBF7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F4EFEA',
  surfaceElevated: '#FFFFFF',
  border: '#E8E2D9',
  borderMuted: '#F4EFEA',
  borderFocus: '#9CA3AF',
  text: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  inputBg: '#FDFBF7',
  inputBorder: '#E8E2D9',
  cardBg: '#FFFFFF',
  cardBorder: '#E8E2D9',
  divider: 'rgba(0, 0, 0, 0.06)',
  shadowColor: '#6B7280',
  statusBar: 'dark',
  quadrants: {
    red: {
      color: '#DC2626',
      subtleBg: 'rgba(220, 38, 38, 0.08)',
      activeBorder: '#DC2626',
      textColor: '#991B1B',
      glow: 'rgba(220, 38, 38, 0.15)',
    },
    yellow: {
      color: '#D97706',
      subtleBg: 'rgba(217, 119, 6, 0.08)',
      activeBorder: '#D97706',
      textColor: '#92400E',
      glow: 'rgba(217, 119, 6, 0.15)',
    },
    blue: {
      color: '#2563EB',
      subtleBg: 'rgba(37, 99, 235, 0.08)',
      activeBorder: '#2563EB',
      textColor: '#1E40AF',
      glow: 'rgba(37, 99, 235, 0.15)',
    },
    green: {
      color: '#059669',
      subtleBg: 'rgba(5, 150, 105, 0.08)',
      activeBorder: '#059669',
      textColor: '#065F46',
      glow: 'rgba(5, 150, 105, 0.15)',
    },
  },
};

