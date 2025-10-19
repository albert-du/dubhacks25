import { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { UserProvider } from './components/UserContext';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { TestPage } from './components/TestPage';
import { PracticePage } from './components/PracticePage';
import { PlayPage } from './components/PlayPage';
import { ProjectsPage } from './components/ProjectsPage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

type Page = 'home' | 'test' | 'practice' | 'play' | 'projects' | 'profile' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'test':
        return <TestPage onNavigate={setCurrentPage} />;
      case 'practice':
        return <PracticePage onNavigate={setCurrentPage} />;
      case 'play':
        return <PlayPage onNavigate={setCurrentPage} />;
      case 'projects':
        return <ProjectsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <UserProvider>
        <div className="size-full flex flex-col landscape-optimized">
          <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="flex-1 overflow-auto">
            {renderPage()}
          </main>
          <PWAInstallPrompt />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}