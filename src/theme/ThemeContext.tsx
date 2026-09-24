import React, { createContext, useContext } from 'react';
import { ThemeColors, lightTheme } from './index';

interface ThemeContextValue {
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme: lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};

