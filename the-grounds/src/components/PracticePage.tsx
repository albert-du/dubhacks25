import { useState, useRef, useEffect } from 'react';
import { Undo, Redo, Eraser, RotateCcw, Pause, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { DrawingCanvas, DrawingCanvasRef } from './DrawingCanvas';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { useUser } from './UserContext';
import { colorOptions } from './colorOptions';

interface PracticePageProps {
  onNavigate?: (page: string) => void;
}

// Commented out old templates - now using AI generation
// const templates = [
//   { name: 'Heart', value: 'heart' },
//   { name: 'Star', value: 'star' },
//   { name: 'Circle', value: 'circle' },
//   { name: 'Daisy', value: 'daisy' },
//   { name: 'Cloud', 'value: 'cloud' },
//   { name: 'Dog', value: 'dog' },
//   { name: 'Music Note', value: 'musicNote' },
// ];

const CONGRATS_MESSAGE = "Great work! Your practice session has been saved. Keep practicing to improve your motor skills!";
const ELEVEN_LABS_API_KEY = ""; //TODO: PUT IN API KEY WHEN NEEDED
const VOICE_ID = "cgSgspJ2msm6clMCkdW9"; 

const playCongratsMessage = async () => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY
        },
        body: JSON.stringify({
          text: CONGRATS_MESSAGE,
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

export function PracticePage({ onNavigate }: PracticePageProps) {
  const { isFirstTime } = useUser(); // Keep isFirstTime for context, but don't use it to trigger setup here
  const [showSetup, setShowSetup] = useState(true);
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'trace' | 'color'>('trace');
  const [color, setColor] = useState('#fa9da6');
  const [lineWidth, setLineWidth] = useState(3);
  const [canvasKey, setCanvasKey] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const canvasRef = useRef<DrawingCanvasRef>(null);

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
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [showSaveAs, setShowSaveAs] = useState(false);

  // AI Generation states
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Removed useEffect for first time setup
  
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
      // Backend returns { id: 'img_123', imageUrl: '/static/img_123.png' }
      // Static files are proxied through nginx to backend
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

  // Removed handleFirstTimeSubmit
  const handleStart = async () => {
    if (topic.trim()) {
      setProjectName(`Practice - ${topic}`);
      
      // Generate AI image from the prompt
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
        type: 'Practice',
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
    playCongratsMessage(); // Play the congratulatory message when drawing is saved
  };

  const handleCloseResults = () => {
    setShowResults(false);
    if (onNavigate) {
      onNavigate('projects');
    }
  };

  const handleReset = () => {
    setCanvasKey((prev) => prev + 1);
    setAccuracy(0);
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
    // If the switch is ON (checked/true), the mode is 'color'. Otherwise, it's 'trace'.
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
      <div className="min-h-screen bg-gradient-to-br from-[#f3e2c6] to-[#fff6a4] dark:from-background dark:to-accent flex items-center justify-center p-4">
        <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-[#fa9da6] dark:border-secondary">
          <h2 className="text-3xl text-[#527a62] dark:text-[#9cc9b3] mb-6 text-center" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
            Practice Mode
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="prompt-input" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Describe what you'd like to practice tracing
              </Label>
              <Input
                id="prompt-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., a simple flower, basic geometric shapes, a cute butterfly..."
                className="w-full mt-2"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              />
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                AI will generate a practice tracing page based on your description
              </p>
            </div>
            <Button
              onClick={handleStart}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-[#fa9da6] hover:bg-[#e88a95] dark:bg-secondary dark:hover:bg-secondary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {isGenerating ? 'Generating your practice page...' : 'Start Practice'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#f3e2c6] dark:bg-background" style={{ height: 'calc(100vh - 73px)' }}>
      {/* Top Bar */}
      <div className="bg-[#fff6a4] dark:bg-accent p-4 border-b-2 border-[#fa9da6] dark:border-secondary">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <p className="text-gray-700 dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Practice mode tracks your accuracy
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
              className="gap-2 bg-[#fa9da6] hover:bg-[#e88a95] dark:bg-secondary dark:hover:bg-secondary/90"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 p-8">
        <div className="h-full bg-white dark:bg-card rounded-xl shadow-lg border-4 border-[#fa9da6] dark:border-secondary overflow-hidden">
          <DrawingCanvas
            key={canvasKey}
            ref={canvasRef}
            color={color}
            lineWidth={lineWidth}
            template={generatedImageUrl ? undefined : topic}
            baseUrl={generatedImageUrl}
            mode={mode}
            onAccuracyUpdate={setAccuracy}
            onFirstStroke={handleFirstStroke}
          />
        </div>
      </div>
      
      {/* Toolbox */}
      <div className="bg-white dark:bg-card border-t-4 border-[#fa9da6] dark:border-secondary p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Mode Switch */}
          <div className="flex items-center justify-center gap-4 pb-4 border-b border-gray-200 dark:border-border">
            <Label className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Trace Mode
            </Label>
            <Switch
              checked={mode === 'color'} 
              // `onCheckedChange` passes `isColorModeEnabled` to the handler now
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
                className="flex-1 bg-[#fa9da6] hover:bg-[#e88a95] dark:bg-secondary dark:hover:bg-secondary/90"
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
              Practice Complete!
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
              {CONGRATS_MESSAGE}
            </p>
            <Button
              onClick={handleCloseResults}
              className="w-full bg-[#fa9da6] hover:bg-[#e88a95] dark:bg-secondary dark:hover:bg-secondary/90"
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