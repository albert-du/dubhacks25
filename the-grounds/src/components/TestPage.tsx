import { useState, useRef, useEffect } from 'react';
import { Undo, Redo, Eraser, Pause, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DrawingCanvas, DrawingCanvasRef } from './DrawingCanvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useUser } from './UserContext';

interface TestPageProps {
  onNavigate?: (page: string) => void;
}

export function TestPage({ onNavigate }: TestPageProps) {
  // Removed name, email, setName, setEmail, isFirstTime, setIsFirstTime from useUser destructuring
  const { } = useUser();
  const [color] = useState('#000000');
  const [lineWidth] = useState(3);
  const [accuracy, setAccuracy] = useState(0);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  
  // Removed First time setup state (showFirstTimeSetup, tempName, tempEmail)

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  // Results dialog
  const [showResults, setShowResults] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [projectName, setProjectName] = useState('Spiral Test');
  const [showSaveAs, setShowSaveAs] = useState(false);

  // Removed useEffect for first time setup
  // useEffect(() => {
  //     if (isFirstTime) {
  //       setShowFirstTimeSetup(true);
  //       setTempName(name);
  //       setTempEmail(email);
  //     }
  // }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Removed handleFirstTimeSubmit function
  // const handleFirstTimeSubmit = () => {
  //     if (tempName.trim() && tempEmail.trim()) {
  //       setName(tempName);
  //       setEmail(tempEmail);
  //       setIsFirstTime(false);
  //       setShowFirstTimeSetup(false);
  //     }
  // };

  const handleFirstStroke = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleDone = () => {
    setIsRunning(false);
    setFinalTime(elapsedTime);
    setFinalAccuracy(accuracy);
    setShowSaveAs(true);
  };

  const handleSaveProject = () => {
    const imageData = canvasRef.current?.getCanvasImage();
    const now = new Date();
    const timeOfDay = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (imageData) {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      projects.unshift({
        id: Date.now(),
        name: projectName,
        type: 'Test',
        date: new Date().toISOString().split('T')[0],
        timeOfDay: timeOfDay,
        thumbnail: imageData,
        time: elapsedTime,
        accuracy: accuracy,
      });
      localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    setShowSaveAs(false);
    setShowResults(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    if (onNavigate) {
      onNavigate('projects');
    }
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  return (
    <div className="flex flex-col bg-[#f3e2c6] dark:bg-background" style={{ height: 'calc(100vh - 73px)' }}>
      {/* Instructions */}
      <div className="bg-[#fff6a4] dark:bg-accent p-4 border-b-2 border-[#86b19c] dark:border-primary">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-center text-gray-700 dark:text-foreground flex-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Trace the spirals below as accurately as possible. Take your time and follow the lines carefully.
          </p>
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePause}
              variant="outline"
              size="sm"
              className="gap-2 bg-white dark:bg-card"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              onClick={handleDone}
              variant="default"
              size="sm"
              className="gap-2 bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-8">
        <div className="h-full bg-white dark:bg-card rounded-xl shadow-lg border-4 border-[#86b19c] dark:border-primary overflow-hidden">
          <DrawingCanvas
            ref={canvasRef}
            color={color}
            lineWidth={lineWidth}
            spirals={true}
            mode="trace"
            onAccuracyUpdate={setAccuracy}
            onFirstStroke={handleFirstStroke}
          />
        </div>
      </div>

      {/* Toolbox */}
      <div className="bg-white dark:bg-card border-t-4 border-[#86b19c] dark:border-primary p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'Lexend, sans-serif' }} className="dark:text-foreground">Pen:</span>
            <div className="w-8 h-8 rounded-full bg-black border-2 border-gray-300 dark:border-gray-600"></div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleUndo}
              variant="outline"
              size="sm"
              className="gap-2"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              <Undo className="w-4 h-4" />
              Undo
            </Button>
            <Button
              onClick={handleRedo}
              variant="outline"
              size="sm"
              className="gap-2"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              <Redo className="w-4 h-4" />
              Redo
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="gap-2"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              <Eraser className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Removed First Time Setup Dialog */}

      {/* Save As Dialog */}
      <Dialog open={showSaveAs} onOpenChange={setShowSaveAs}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              Save Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Project Name
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSaveAs(false)}
                variant="outline"
                className="flex-1"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProject}
                className="flex-1 bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={handleCloseResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              Test Complete!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Total Time
                </p>
                <p className="text-3xl font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {formatTime(finalTime)}
                </p>
              </div>
              <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Accuracy
                </p>
                <p className="text-3xl font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {finalAccuracy.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground text-center" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Great job! Your test results have been saved. You can review your progress in the Profile section.
            </p>
            <Button
              onClick={handleCloseResults}
              className="w-full bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}