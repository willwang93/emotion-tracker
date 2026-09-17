import { QuadrantType } from '../types';

export interface QuadrantColorSet {
  color: string;
  subtleBg: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  subTextColor: string;
  selectedChipBg: string;
  selectedChipBorder: string;
  selectedChipText: string;
  glow: string;
  activeBorder: string;
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
  chipBg: string;
  chipBorder: string;
  chipText: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  activeDayBg: string;
  sunGlow: string;
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
  background: '#0F1115',
  surface: '#181B22',
  surfaceSecondary: '#20242D',
  surfaceElevated: '#20242D',
  border: 'rgba(255, 255, 255, 0.07)',
  borderMuted: 'rgba(255, 255, 255, 0.04)',
  borderFocus: 'rgba(255, 255, 255, 0.15)',
  text: '#F3F0EA',
  textSecondary: '#C7C3BD',
  textMuted: '#8C867E',
  textSubtle: '#66615B',
  chipBg: 'rgba(255, 255, 255, 0.06)',
  chipBorder: 'rgba(255, 255, 255, 0.05)',
  chipText: '#C7C3BD',
  btnPrimaryBg: '#EDE8DE',
  btnPrimaryText: '#121417',
  activeDayBg: 'rgba(255, 255, 255, 0.12)',
  sunGlow: 'rgba(245, 158, 11, 0.16)',
  inputBg: '#181B22',
  inputBorder: 'rgba(255, 255, 255, 0.10)',
  cardBg: '#181B22',
  cardBorder: 'rgba(255, 255, 255, 0.07)',
  divider: 'rgba(255, 255, 255, 0.07)',
  shadowColor: '#000000',
  statusBar: 'light',
  quadrants: {
    yellow: {
      color: '#F59E0B',
      subtleBg: 'rgba(245, 158, 11, 0.14)',
      cardBg: '#261D10',
      cardBorder: 'rgba(245, 158, 11, 0.40)',
      textColor: '#FDE68A',
      subTextColor: '#FCD34D',
      selectedChipBg: 'rgba(245, 158, 11, 0.24)',
      selectedChipBorder: 'rgba(245, 158, 11, 0.60)',
      selectedChipText: '#FFFBEB',
      glow: 'rgba(245, 158, 11, 0.25)',
      activeBorder: 'rgba(245, 158, 11, 0.60)',
    },
    red: {
      color: '#EF4444',
      subtleBg: 'rgba(239, 68, 68, 0.14)',
      cardBg: '#281217',
      cardBorder: 'rgba(239, 68, 68, 0.40)',
      textColor: '#FECDD3',
      subTextColor: '#FDA4AF',
      selectedChipBg: 'rgba(239, 68, 68, 0.24)',
      selectedChipBorder: 'rgba(239, 68, 68, 0.60)',
      selectedChipText: '#FFF1F2',
      glow: 'rgba(239, 68, 68, 0.25)',
      activeBorder: 'rgba(239, 68, 68, 0.60)',
    },
    green: {
      color: '#10B981',
      subtleBg: 'rgba(16, 185, 129, 0.14)',
      cardBg: '#0F241C',
      cardBorder: 'rgba(16, 185, 129, 0.40)',
      textColor: '#A7F3D0',
      subTextColor: '#6EE7B7',
      selectedChipBg: 'rgba(16, 185, 129, 0.24)',
      selectedChipBorder: 'rgba(16, 185, 129, 0.60)',
      selectedChipText: '#ECFDF5',
      glow: 'rgba(16, 185, 129, 0.25)',
      activeBorder: 'rgba(16, 185, 129, 0.60)',
    },
    blue: {
      color: '#3B82F6',
      subtleBg: 'rgba(59, 130, 246, 0.14)',
      cardBg: '#111D2D',
      cardBorder: 'rgba(59, 130, 246, 0.40)',
      textColor: '#BFDBFE',
      subTextColor: '#93C5FD',
      selectedChipBg: 'rgba(59, 130, 246, 0.24)',
      selectedChipBorder: 'rgba(59, 130, 246, 0.60)',
      selectedChipText: '#EFF6FF',
      glow: 'rgba(59, 130, 246, 0.25)',
      activeBorder: 'rgba(59, 130, 246, 0.60)',
    },
  },
};

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#FBF9F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAF7F2',
  surfaceElevated: '#FAF7F2',
  border: '#EFEAE1',
  borderMuted: '#FAF7F2',
  borderFocus: '#E3DDCF',
  text: '#2D2A26',
  textSecondary: '#78716C',
  textMuted: '#9E968D',
  textSubtle: '#C4BEB4',
  chipBg: '#F3EFE7',
  chipBorder: '#EFEAE1',
  chipText: '#2D2A26',
  btnPrimaryBg: '#2D2A26',
  btnPrimaryText: '#FBF9F5',
  activeDayBg: 'rgba(0, 0, 0, 0.06)',
  sunGlow: 'rgba(245, 158, 11, 0.22)',
  inputBg: '#FFFFFF',
  inputBorder: '#E3DDCF',
  cardBg: '#FFFFFF',
  cardBorder: '#EFEAE1',
  divider: 'rgba(0, 0, 0, 0.05)',
  shadowColor: '#2D2A26',
  statusBar: 'dark',
  quadrants: {
    yellow: {
      color: '#F59E0B',
      subtleBg: 'rgba(245, 158, 11, 0.10)',
      cardBg: 'rgba(245, 158, 11, 0.10)',
      cardBorder: 'rgba(245, 158, 11, 0.30)',
      textColor: '#B45309',
      subTextColor: '#D97706',
      selectedChipBg: '#F59E0B',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(245, 158, 11, 0.20)',
      activeBorder: '#F59E0B',
    },
    red: {
      color: '#EF4444',
      subtleBg: 'rgba(239, 68, 68, 0.09)',
      cardBg: 'rgba(239, 68, 68, 0.09)',
      cardBorder: 'rgba(239, 68, 68, 0.26)',
      textColor: '#BE123C',
      subTextColor: '#E11D48',
      selectedChipBg: '#EF4444',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(239, 68, 68, 0.20)',
      activeBorder: '#EF4444',
    },
    green: {
      color: '#10B981',
      subtleBg: 'rgba(16, 185, 129, 0.10)',
      cardBg: 'rgba(16, 185, 129, 0.10)',
      cardBorder: 'rgba(16, 185, 129, 0.30)',
      textColor: '#047857',
      subTextColor: '#059669',
      selectedChipBg: '#10B981',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(16, 185, 129, 0.20)',
      activeBorder: '#10B981',
    },
    blue: {
      color: '#3B82F6',
      subtleBg: 'rgba(59, 130, 246, 0.09)',
      cardBg: 'rgba(59, 130, 246, 0.09)',
      cardBorder: 'rgba(59, 130, 246, 0.26)',
      textColor: '#1D4ED8',
      subTextColor: '#2563EB',
      selectedChipBg: '#3B82F6',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(59, 130, 246, 0.20)',
      activeBorder: '#3B82F6',
    },
  },
};

