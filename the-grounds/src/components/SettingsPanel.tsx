import { Settings, Sun, Moon, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTheme } from './ThemeProvider';

const colorPresets = [
  { name: 'Default', colors: ['#fa9da6', '#fbccd4', '#fff6a4', '#f3e2c6', '#86b19c'] },
  { name: 'Ocean', colors: ['#6B9BD1', '#A8DADC', '#457B9D', '#1D3557', '#F1FAEE'] },
  { name: 'Sunset', colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#FFA07A'] },
  { name: 'Forest', colors: ['#52B788', '#95D5B2', '#B7E4C7', '#D8F3DC', '#74C69D'] },
];

export function SettingsPanel() {
  const { theme, setTheme, accessibility, updateAccessibility } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-[#86b19c]" style={{ fontFamily: 'Mansalva, cursive' }}>
        Settings
      </h2>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <Settings className="w-5 h-5" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" style={{ fontFamily: 'Lexend, sans-serif' }}>
                High Contrast Mode
              </Label>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Enhance visibility with increased contrast
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={accessibility.highContrast}
              onCheckedChange={(checked) => updateAccessibility({ highContrast: checked })}
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="font-size" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Font Size
            </Label>
            <Select
              value={accessibility.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                updateAccessibility({ fontSize: value })
              }
            >
              <SelectTrigger id="font-size" style={{ fontFamily: 'Lexend, sans-serif' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Small
                </SelectItem>
                <SelectItem value="medium" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Medium
                </SelectItem>
                <SelectItem value="large" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Large
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboard-shortcuts" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Keyboard Shortcuts
              </Label>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Enable keyboard navigation shortcuts
              </p>
            </div>
            <Switch
              id="keyboard-shortcuts"
              checked={accessibility.keyboardShortcuts}
              onCheckedChange={(checked) => updateAccessibility({ keyboardShortcuts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <Palette className="w-5 h-5" />
            Themes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark/Light Mode */}
          <div className="space-y-4">
            <Label style={{ fontFamily: 'Lexend, sans-serif' }}>Display Mode</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-[#86b19c] bg-[#86b19c]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span style={{ fontFamily: 'Lexend, sans-serif' }}>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-[#86b19c] bg-[#86b19c]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span style={{ fontFamily: 'Lexend, sans-serif' }}>Dark</span>
              </button>
            </div>
          </div>

          {/* Color Presets */}
          <div className="space-y-4">
            <Label style={{ fontFamily: 'Lexend, sans-serif' }}>Color Presets</Label>
            <div className="space-y-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  className="w-full p-4 border-2 rounded-lg hover:border-gray-300 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Lexend, sans-serif' }}>{preset.name}</span>
                    <div className="flex gap-1">
                      {preset.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
