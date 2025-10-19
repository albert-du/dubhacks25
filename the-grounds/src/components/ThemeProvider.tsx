import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ColorPreset = 'default' | 'ocean' | 'sunset' | 'forest';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  keyboardShortcuts: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorPreset: ColorPreset;
  setColorPreset: (preset: ColorPreset) => void;
  accessibility: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorPresets = {
  default: {
    primary: '#86b19c',
    secondary: '#fbccd4',
    accent: '#fff6a4',
    pink: '#fa9da6',
    cream: '#f3e2c6',
  },
  ocean: {
    primary: '#6B9BD1',
    secondary: '#A8DADC',
    accent: '#F1FAEE',
    pink: '#457B9D',
    cream: '#1D3557',
  },
  sunset: {
    primary: '#4ECDC4',
    secondary: '#FFE66D',
    accent: '#FFA07A',
    pink: '#FF6B6B',
    cream: '#45B7D1',
  },
  forest: {
    primary: '#52B788',
    secondary: '#95D5B2',
    accent: '#D8F3DC',
    pink: '#74C69D',
    cream: '#B7E4C7',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [colorPreset, setColorPreset] = useState<ColorPreset>('default');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 'medium',
    keyboardShortcuts: true,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size mapping
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '20px',
    };
    root.style.setProperty('--font-size', fontSizeMap[accessibility.fontSize]);
  }, [accessibility]);

  // Apply color preset
  useEffect(() => {
    const root = document.documentElement;
    const colors = colorPresets[colorPreset];
    
    // CSS variables for use throughout the app
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-pink', colors.pink);
    root.style.setProperty('--color-cream', colors.cream);
    
    // Update background colors
    if (colorPreset !== 'default') {
      root.style.setProperty('--preset-bg-1', colors.cream);
      root.style.setProperty('--preset-bg-2', colors.secondary);
      root.style.setProperty('--preset-bg-3', colors.accent);
      root.style.setProperty('--preset-border', colors.primary);
      root.style.setProperty('--preset-text', colors.pink);
    } else {
      root.style.removeProperty('--preset-bg-1');
      root.style.removeProperty('--preset-bg-2');
      root.style.removeProperty('--preset-bg-3');
      root.style.removeProperty('--preset-border');
      root.style.removeProperty('--preset-text');
    }
  }, [colorPreset]);

  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...settings }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorPreset,
        setColorPreset,
        accessibility,
        updateAccessibility,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}