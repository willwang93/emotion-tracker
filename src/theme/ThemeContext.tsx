import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { ThemeColors, darkTheme, lightTheme } from './index';
import { getThemeSetting, setThemeSetting } from '../services/db';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  isDark: true,
  mode: 'system',
  setMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hookScheme = useColorScheme();
  const [appearanceScheme, setAppearanceScheme] = useState(Appearance.getColorScheme());
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    getThemeSetting().then((savedMode) => {
      setModeState(savedMode);
    });

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setAppearanceScheme(colorScheme);
    });

    return () => sub.remove();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await setThemeSetting(newMode);
  };

  const activeScheme = hookScheme || appearanceScheme;
  const isDark =
    mode === 'system'
      ? activeScheme === 'dark'
      : mode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};
