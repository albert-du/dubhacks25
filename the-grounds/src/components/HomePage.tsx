import { Palette, Target, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useUser } from './UserContext'; // Assuming useUser is available
interface HomePageProps {
  onNavigate: (page: 'test' | 'practice' | 'play') => void;
}
export function HomePage({ onNavigate }: HomePageProps) {
  const { name, email, setName, setEmail, isFirstTime, setIsFirstTime } = useUser();
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  useEffect(() => {
    // Only show setup if it's the first time
    if (isFirstTime) {
      setShowFirstTimeSetup(true);
      setTempName(name); // Initialize with current context values (if any)
      setTempEmail(email);
    }
  }, [isFirstTime, name, email]);
  const handleFirstTimeSubmit = () => {
    if (tempName.trim() && tempEmail.trim()) {
      setName(tempName);
      setEmail(tempEmail);
      setIsFirstTime(false); // Mark as no longer first time
      setShowFirstTimeSetup(false); // Close the dialog
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#f0d5d8] to-[#e5c4c9] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#2a2020] dark:to-[#2a1a1a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 mt-8">
          <h1 className="mb-6 text-5xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
            Welcome to The Grounds!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-lg" style={{ fontFamily: 'Lexend, sans-serif' }}>
            A fun and interactive space designed to help you practice fine motor skills through drawing and coloring. Choose an activity below to get started.
          </p>
        </div>
        {/* Activity Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Test Card */}
          <button
            onClick={() => onNavigate('test')}
            className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-4 border-[#86b19c] dark:border-[#9cc9b3] text-left w-full"
          >
            <div className="bg-[#86b19c] dark:bg-[#9cc9b3] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white dark:text-gray-900" />
            </div>
            <h2 className="text-center mb-4 text-3xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              Test
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 min-h-[60px]" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Assess your current fine motor skills by tracing spirals with precision
            </p>
          </button>
          {/* Practice Card */}
          <button
            onClick={() => onNavigate('practice')}
            className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-4 border-[#fa9da6] dark:border-[#fa9da6] text-left w-full"
          >
            <div className="bg-[#fa9da6] dark:bg-[#fa9da6] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Palette className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-center mb-4 text-3xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              Practice
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 min-h-[60px]" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Improve your accuracy with guided tracing and coloring exercises that track your progress
            </p>
          </button>
          {/* Play Card */}
          <button
            onClick={() => onNavigate('play')}
            className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-4 border-[#fff6a4] dark:border-[#d4ba3c] text-left w-full"
          >
            <div className="bg-[#fff6a4] dark:bg-[#d4ba3c] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gray-700 dark:text-gray-900" />
            </div>
            <h2 className="text-center mb-4 text-3xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              Play
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 min-h-[60px]" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Enjoy stress-free creative drawing with self-correcting tools for a relaxing experience
            </p>
          </button>
        </div>
        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto border-2 border-white dark:border-[#3a3a3a]">
            <h3 className="mb-4 text-2xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              About The Grounds
            </h3>
            <p className="text-gray-700 dark:text-gray-300" style={{ fontFamily: 'Lexend, sans-serif' }}>
              The Grounds is specially designed for individuals with Parkinson's disease to practice and maintain fine motor skills through enjoyable, interactive drawing activities. Each mode offers different levels of support and tracking to meet your specific needs.
            </p>
          </div>
        </div>
      </div>
      {/* First Time Setup Dialog - Moved from PracticePage */}
      <Dialog open={showFirstTimeSetup} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
                Please provide your information to get started.
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">

              <div>
                <Label htmlFor="setup-name" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif', marginBottom: '12px' }}>
                  Name
                </Label>
                <Input
                  id="setup-name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                />
              </div>
              <div>
                <Label htmlFor="setup-email" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif', marginBottom: '12px' }}>
                  Email
                </Label>
                <Input
                  id="setup-email"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                />
              </div>
              <Button
                onClick={handleFirstTimeSubmit}
                disabled={!tempName.trim() || !tempEmail.trim()}
                className="w-full bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                Get Started
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}