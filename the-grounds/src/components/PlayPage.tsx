import { useState, useRef, useEffect } from 'react';
import { Undo, Redo, Eraser, RotateCcw, Pause, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DrawingCanvas, DrawingCanvasRef } from './DrawingCanvas';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUser } from './UserContext';
import { colorOptions } from './colorOptions';

interface PlayPageProps {
  onNavigate?: (page: string) => void;
}

export function PlayPage({ onNavigate }: PlayPageProps) {
  const { } = useUser(); 
  const [showSetup, setShowSetup] = useState(true);
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'trace' | 'color'>('trace');
  const [color, setColor] = useState('#fa9da6');
  const [lineWidth, setLineWidth] = useState(3);
  const [canvasKey, setCanvasKey] = useState(0);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  
  // AI Image generation state
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom color picker
  const [customColor, setCustomColor] = useState('#fa9da6');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  // Results dialog
  const [showResults, setShowResults] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [showSaveAs, setShowSaveAs] = useState(false);

  // LLM Encouragement state
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isLoadingEncouragement, setIsLoadingEncouragement] = useState(false);

  const ELEVEN_LABS_API_KEY = ""; //TODO: PUT IN API KEY WHEN NEEDED
  const VOICE_ID = "cgSgspJ2msm6clMCkdW9"; 

  const playCongratsMessage = async (message: string) => {
    if (!ELEVEN_LABS_API_KEY) {
      console.log('ElevenLabs API key not set, skipping audio');
      return;
    }
    
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY
        },
        body: JSON.stringify({
          text: message,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audio = new Audio(URL.createObjectURL(audioBlob));
      await audio.play();
    } catch (error) {
      console.error('Error playing congratulatory message:', error);
    }
  };

  // Function to fetch personalized encouragement from LLM
  const fetchEncouragement = async () => {
    setIsLoadingEncouragement(true);
    try {
      // Get previous sessions from localStorage
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const playSessions = projects
        .filter((p: any) => p.type === 'Play')
        .slice(0, 10) // Get last 10 sessions (most recent first)
        .reverse(); // Reverse to show oldest to newest for better context
      
      // Format history context for the LLM
      let historyContext = 'User drawing practice history:\n\n';
      
      if (playSessions.length === 0) {
        historyContext += 'This is the user\'s very first session! Welcome them warmly and encourage them to enjoy the creative process.\n';
      } else {
        historyContext += `Past sessions (from oldest to most recent):\n`;
        playSessions.forEach((session: any, index: number) => {
          const sessionNum = index + 1;
          const topicName = session.name.replace('Play - ', '');
          const timeFormatted = Math.floor(session.time / 60) > 0 
            ? `${Math.floor(session.time / 60)}m ${session.time % 60}s`
            : `${session.time}s`;
          
          historyContext += `  ${sessionNum}. "${topicName}" - ${timeFormatted} (${session.date})\n`;
        });
      }
      
      // Add current session info
      const currentTimeFormatted = Math.floor(elapsedTime / 60) > 0 
        ? `${Math.floor(elapsedTime / 60)} minutes ${elapsedTime % 60} seconds`
        : `${elapsedTime} seconds`;
        
      historyContext += `\nCurrent session just completed:\n`;
      historyContext += `  Topic: "${topic}"\n`;
      historyContext += `  Time: ${currentTimeFormatted}\n`;
      historyContext += `  Total sessions completed: ${playSessions.length + 1}\n`;
      historyContext += '\nContext: This is a therapeutic drawing and coloring app for individuals with Parkinson\'s disease. Focus on celebrating their creative expression, consistency, and the joy of the artistic process. Be warm, personal, and genuinely encouraging.';

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
        setEncouragementMessage('Wonderful work! Your drawing has been saved. Keep enjoying the creative process!');
      }
    } catch (error) {
      console.error('Error fetching encouragement:', error);
      // Fallback message if API fails
      setEncouragementMessage('Wonderful work! Your drawing has been saved. Keep enjoying the creative process!');
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

  const generateImage = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fullImageUrl = `${apiUrl}${data.imageUrl}`;
      setGeneratedImageUrl(fullImageUrl);
      return fullImageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = async () => {
    if (topic.trim()) {
      setProjectName(`Play - ${topic}`);
      const imageUrl = await generateImage(topic);
      if (imageUrl) {
        setShowSetup(false);
      }
    }
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
        type: 'Play',
        date: new Date().toISOString().split('T')[0],
        timeOfDay: timeOfDay,
        thumbnail: imageData,
        time: elapsedTime,
        accuracy: null,
      });
      localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    setShowSaveAs(false);
    
    // Fetch personalized encouragement before showing results
    await fetchEncouragement();
    
    setShowResults(true);
  };

  // Play audio when encouragement message is loaded
  useEffect(() => {
    if (encouragementMessage && showResults && !isLoadingEncouragement) {
      playCongratsMessage(encouragementMessage);
    }
  }, [encouragementMessage, showResults, isLoadingEncouragement]);

  const handleCloseResults = () => {
    setShowResults(false);
    setEncouragementMessage(''); // Reset for next session
    if (onNavigate) {
      onNavigate('projects');
    }
  };

  const handleReset = () => {
    setCanvasKey((prev) => prev + 1);
    setElapsedTime(0);
    setIsRunning(false);
    setIsPaused(false);
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

  const handleModeChange = (isColorModeEnabled: boolean) => {
    const newMode = isColorModeEnabled ? 'color' : 'trace';
    setMode(newMode);
    
    if (newMode === 'trace') {
      setColor('#000000');
    } else {
      setColor(customColor);
    }
  };

  const handleColorChange = (newColor: string) => {
    setCustomColor(newColor);
    if (mode === 'color') {
      setColor(newColor);
    }
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6a4] to-[#fbccd4] dark:from-accent dark:to-secondary flex items-center justify-center p-4">
        <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-[#86b19c] dark:border-primary">
          <h2 className="text-3xl text-[#527a62] dark:text-[#9cc9b3] mb-6 text-center" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
            Play Mode
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="prompt-input" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Describe what you'd like to draw
              </Label>
              <Input
                id="prompt-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., a happy dog playing in a park, a beautiful mountain landscape..."
                className="w-full mt-2"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              />
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                AI will generate a coloring page based on your description
              </p>
            </div>

            <Button
              onClick={handleStart}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {isGenerating ? 'Generating your coloring page...' : 'Start Playing'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#fff6a4] dark:bg-accent" style={{ height: 'calc(100vh - 73px)' }}>
      {/* Top Bar */}
      <div className="bg-[#86b19c] dark:bg-primary p-4 border-b-2 border-[#fa9da6] dark:border-secondary">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <p className="text-white dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Play mode: Relax and enjoy drawing with self-correcting assistance
            </p>
          </div>
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
              className="gap-2 bg-white hover:bg-gray-100 text-[#86b19c] dark:bg-card dark:hover:bg-muted dark:text-foreground"
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
            key={canvasKey}
            ref={canvasRef}
            color={color}
            lineWidth={lineWidth}
            template={generatedImageUrl ? undefined : (topic === 'freeform' ? undefined : topic)}
            baseUrl={generatedImageUrl}
            mode={mode}
            selfCorrecting={true}
            onFirstStroke={handleFirstStroke}
          />
        </div>
      </div>

      {/* Toolbox */}
      <div className="bg-white dark:bg-card border-t-4 border-[#86b19c] dark:border-primary p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Mode Switch */}
          <div className="flex items-center justify-center gap-4 pb-4 border-b border-gray-200 dark:border-border">
            <Label className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Trace Mode
            </Label>
            <Switch
              checked={mode === 'color'} 
              onCheckedChange={handleModeChange}
            />
            <Label className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Color Mode
            </Label>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Left: Color controls */}
            <div className="flex items-center gap-4">
              {mode === 'color' && (
                <>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'Lexend, sans-serif' }} className="dark:text-foreground">Color:</span>
                    <div className="flex gap-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleColorChange(option.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            customColor === option.value ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: option.value }}
                          title={option.name}
                        />
                      ))}
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500"
                        title="Custom Color"
                      />
                    </div>
                  </div>
                  
                  {showColorPicker && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'Lexend, sans-serif' }} className="dark:text-foreground">Size:</span>
                    <Slider
                      value={[lineWidth]}
                      onValueChange={(value) => setLineWidth(value[0])}
                      min={1}
                      max={20}
                      step={1}
                      className="w-32"
                    />
                    <span className="w-8 text-center dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>{lineWidth}</span>
                  </div>
                </>
              )}
              {mode === 'trace' && (
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'Lexend, sans-serif' }} className="dark:text-foreground">Pen:</span>
                  <div className="w-8 h-8 rounded-full bg-black border-2 border-gray-300 dark:border-gray-600"></div>
                </div>
              )}
            </div>

            {/* Right: Action buttons */}
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
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
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
              Great Session!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Total Time
              </p>
              <p className="text-4xl font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                {formatTime(finalTime)}
              </p>
            </div>
            
            {isLoadingEncouragement ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                  <p className="text-sm text-blue-600 dark:text-blue-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Generating personalized encouragement...
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {encouragementMessage || 'Wonderful work! Your drawing has been saved. Keep enjoying the creative process!'}
                </p>
              </div>
            )}
            
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