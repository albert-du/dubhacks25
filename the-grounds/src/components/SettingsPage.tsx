import { Settings, Sun, Moon, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

const colorPresets = [
  { name: 'Default (Original)', value: 'default', colors: ['#fa9da6', '#fbccd4', '#fff6a4', '#f3e2c6', '#86b19c'] },
  { name: 'Ocean', value: 'ocean', colors: ['#6B9BD1', '#A8DADC', '#457B9D', '#1D3557', '#F1FAEE'] },
  { name: 'Sunset', value: 'sunset', colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#FFA07A'] },
  { name: 'Forest', value: 'forest', colors: ['#52B788', '#95D5B2', '#B7E4C7', '#D8F3DC', '#74C69D'] },
];

export function SettingsPage() {
  const { theme, setTheme, colorPreset, setColorPreset, accessibility, updateAccessibility } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#f0d5d8] to-[#e5c4c9] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#2a2020] dark:to-[#2a1a1a] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-4xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
          Settings
        </h2>

        {/* Accessibility Settings */}
        <Card className="border-4 border-[#86b19c] dark:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              <Settings className="w-5 h-5" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  High Contrast Mode
                </Label>
                <p className="text-sm text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
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
              <Label htmlFor="font-size" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
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
                <Label htmlFor="keyboard-shortcuts" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Keyboard Shortcuts
                </Label>
                <p className="text-sm text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Enable keyboard navigation shortcuts
                </p>
              </div>
              <Switch
                id="keyboard-shortcuts"
                checked={accessibility.keyboardShortcuts}
                onCheckedChange={(checked) =>
                  updateAccessibility({ keyboardShortcuts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="border-4 border-[#fa9da6] dark:border-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Dark Mode
                </Label>
                <p className="text-sm text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-4 border-[#fff6a4] dark:border-[#f4ed94]">
          <CardHeader>
            <CardTitle className="text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              About The Grounds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              The Grounds is designed to help Parkinson's patients practice fine motor skills through engaging drawing exercises.
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              <div>
                <strong className="text-[#86b19c] dark:text-[#9cc9b3]">Test Mode:</strong> Assessment with spirals to track baseline performance
              </div>
              <div>
                <strong className="text-[#fa9da6] dark:text-[#e88a95]">Practice Mode:</strong> Accuracy tracking with customizable templates
              </div>
              <div>
                <strong className="text-[#527a62] dark:text-[#9cc9b3]">Play Mode:</strong> Self-correcting assistance for relaxed, creative drawing
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
