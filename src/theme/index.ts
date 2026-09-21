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
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
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

export const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
};

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#0F1115',
  surface: '#181B22',
  surfaceSecondary: '#20242D',
  surfaceElevated: '#20242D',
  surfaceContainer: '#1C2028',
  surfaceContainerLow: '#15181E',
  surfaceContainerHigh: '#252A34',
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
  btnPrimaryBg: '#F57C00',
  btnPrimaryText: '#FFFFFF',
  activeDayBg: 'rgba(255, 255, 255, 0.12)',
  sunGlow: 'rgba(245, 124, 0, 0.25)',
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
  background: '#FEF9EE',
  surface: '#FFFFFF',
  surfaceSecondary: '#FFF5E4',
  surfaceElevated: '#FFFFFF',
  surfaceContainer: '#F2EDE3',
  surfaceContainerLow: '#F8F3E8',
  surfaceContainerHigh: '#ECE8DD',
  border: '#EFEAE1',
  borderMuted: '#F2EDE3',
  borderFocus: '#DEC1AF',
  text: '#1D1C15',
  textSecondary: '#574235',
  textMuted: '#8B7263',
  textSubtle: '#B0A89F',
  chipBg: '#FFF5E4',
  chipBorder: '#EFEAE1',
  chipText: '#2D2319',
  btnPrimaryBg: '#F57C00',
  btnPrimaryText: '#FFFFFF',
  activeDayBg: 'rgba(245, 124, 0, 0.12)',
  sunGlow: 'rgba(245, 124, 0, 0.35)',
  inputBg: '#FFF5E4',
  inputBorder: '#EFEAE1',
  cardBg: '#FFFFFF',
  cardBorder: '#EFEAE1',
  divider: 'rgba(0, 0, 0, 0.05)',
  shadowColor: '#BD8948',
  statusBar: 'dark',
  quadrants: {
    yellow: {
      color: '#F57C00',
      subtleBg: '#FFF0D0',
      cardBg: '#FFF0D0',
      cardBorder: '#FDE68A',
      textColor: '#964900',
      subTextColor: '#B45309',
      selectedChipBg: '#F57C00',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(245, 124, 0, 0.25)',
      activeBorder: '#F57C00',
    },
    red: {
      color: '#EF4444',
      subtleBg: '#FEEAE1',
      cardBg: '#FEEAE1',
      cardBorder: '#FECDD3',
      textColor: '#BA1A1A',
      subTextColor: '#E11D48',
      selectedChipBg: '#EF4444',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(239, 68, 68, 0.25)',
      activeBorder: '#EF4444',
    },
    green: {
      color: '#61AD7B',
      subtleBg: '#EAF5EE',
      cardBg: '#EAF5EE',
      cardBorder: '#A7F3D0',
      textColor: '#1B6C40',
      subTextColor: '#047857',
      selectedChipBg: '#61AD7B',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(97, 173, 123, 0.25)',
      activeBorder: '#61AD7B',
    },
    blue: {
      color: '#3E66FB',
      subtleBg: '#E6ECFE',
      cardBg: '#E6ECFE',
      cardBorder: '#BFDBFE',
      textColor: '#194BE2',
      subTextColor: '#2563EB',
      selectedChipBg: '#3E66FB',
      selectedChipBorder: 'transparent',
      selectedChipText: '#FFFFFF',
      glow: 'rgba(62, 102, 251, 0.25)',
      activeBorder: '#3E66FB',
    },
  },
};

