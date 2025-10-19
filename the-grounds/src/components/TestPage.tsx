import { useState, useRef, useEffect } from 'react';
import { Undo, Redo, Eraser, Pause, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DrawingCanvas, DrawingCanvasRef } from './DrawingCanvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from './UserContext';

interface TestPageProps {
  onNavigate?: (page: string) => void;
}

export function TestPage({ onNavigate }: TestPageProps) {
  const { } = useUser();
  const [color] = useState('#000000');
  const [lineWidth] = useState(3);
  const [accuracy, setAccuracy] = useState(0);
  const canvasRef = useRef<DrawingCanvasRef>(null);

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

  // LLM Encouragement state
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isLoadingEncouragement, setIsLoadingEncouragement] = useState(false);

  // Function to fetch personalized encouragement from LLM
  const fetchEncouragement = async () => {
    setIsLoadingEncouragement(true);
    try {
      // Get previous test sessions from localStorage
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const testSessions = projects
        .filter((p: any) => p.type === 'Test')
        .slice(0, 10)
        .reverse();
      
      // Format history context for the LLM
      let historyContext = 'User spiral test history:\n\n';
      
      if (testSessions.length === 0) {
        historyContext += 'This is the user\'s very first spiral test! Welcome them warmly and encourage them on their motor skills tracking journey.\n';
      } else {
        historyContext += `Past test sessions (from oldest to most recent):\n`;
        testSessions.forEach((session: any, index: number) => {
          const sessionNum = index + 1;
          const timeFormatted = Math.floor(session.time / 60) > 0 
            ? `${Math.floor(session.time / 60)}m ${session.time % 60}s`
            : `${session.time}s`;
          
          historyContext += `  ${sessionNum}. Time: ${timeFormatted}, Accuracy: ${session.accuracy}% (${session.date})\n`;
        });
      }
      
      // Add current session info
      const currentTimeFormatted = Math.floor(finalTime / 60) > 0 
        ? `${Math.floor(finalTime / 60)} minutes ${finalTime % 60} seconds`
        : `${finalTime} seconds`;
        
      historyContext += `\nCurrent test just completed:\n`;
      historyContext += `  Time: ${currentTimeFormatted}\n`;
      historyContext += `  Accuracy: ${finalAccuracy.toFixed(1)}%\n`;
      historyContext += `  Total tests completed: ${testSessions.length + 1}\n`;
      historyContext += '\nContext: This is a spiral tracing test used to track motor skills for individuals with Parkinson\'s disease. The test measures both accuracy and time. Focus on celebrating consistency, any improvements (especially in accuracy), and the commitment to regular tracking. Be encouraging about the importance of the data they\'re collecting for monitoring their progress over time.';

      // Call your Flask LLM API
      const llmApiUrl = import.meta.env.VITE_LLM_API_URL || 'http://localhost:5001';
      const response = await fetch(`${llmApiUrl}/api/encourage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history_context: historyContext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.message) {
        setEncouragementMessage(data.message);
      } else {
        setEncouragementMessage('Excellent work completing this test! Your consistent tracking helps monitor your progress over time.');
      }
    } catch (error) {
      console.error('Error fetching encouragement:', error);
      setEncouragementMessage('Excellent work completing this test! Your consistent tracking helps monitor your progress over time.');
    } finally {
      setIsLoadingEncouragement(false);
    }
  };

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

  const handleSaveProject = async () => {
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
        time: finalTime,
        accuracy: finalAccuracy,
      });
      localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    setShowSaveAs(false);
    setShowResults(true);
    
    // Fetch personalized encouragement AFTER dialog is visible
    await fetchEncouragement();
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setEncouragementMessage('');
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
            <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3] flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              <Sparkles className="w-6 h-6 text-yellow-500" />
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
            
            {isLoadingEncouragement ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                  <p className="text-sm text-blue-600 dark:text-blue-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Analyzing your progress...
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {encouragementMessage || 'Excellent work completing this test! Your consistent tracking helps monitor your progress over time.'}
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-muted-foreground text-center" style={{ fontFamily: 'Lexend, sans-serif' }}>
              You can review your progress trends in the Profile section.
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