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

interface PracticePageProps {
  onNavigate?: (page: string) => void;
}

const ELEVEN_LABS_API_KEY = "sk_67b54fa3b8d90b8ccac535383bf6bdf98ba6b45880b09a22";
const VOICE_ID = "cgSgspJ2msm6clMCkdW9"; 

export function PracticePage({ onNavigate }: PracticePageProps) {
  const { isFirstTime } = useUser();
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
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');

  // LLM Encouragement state
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isLoadingEncouragement, setIsLoadingEncouragement] = useState(false);

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
      // Get previous practice sessions from localStorage
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const practiceSessions = projects
        .filter((p: any) => p.type === 'Practice')
        .slice(0, 10)
        .reverse();
      
      // Format history context for the LLM
      let historyContext = 'User practice tracing history:\n\n';
      
      if (practiceSessions.length === 0) {
        historyContext += 'This is the user\'s very first practice session! Welcome them warmly and encourage them on their motor skills practice journey.\n';
      } else {
        historyContext += `Past practice sessions (from oldest to most recent):\n`;
        practiceSessions.forEach((session: any, index: number) => {
          const sessionNum = index + 1;
          const topicName = session.name.replace('Practice - ', '');
          const timeFormatted = Math.floor(session.time / 60) > 0 
            ? `${Math.floor(session.time / 60)}m ${session.time % 60}s`
            : `${session.time}s`;
          
          historyContext += `  ${sessionNum}. "${topicName}" - Time: ${timeFormatted}, Accuracy: ${session.accuracy}% (${session.date})\n`;
        });
      }
      
      // Add current session info
      const currentTimeFormatted = Math.floor(finalTime / 60) > 0 
        ? `${Math.floor(finalTime / 60)} minutes ${finalTime % 60} seconds`
        : `${finalTime} seconds`;
        
      historyContext += `\nCurrent practice session just completed:\n`;
      historyContext += `  Topic: "${topic}"\n`;
      historyContext += `  Time: ${currentTimeFormatted}\n`;
      historyContext += `  Accuracy: ${finalAccuracy.toFixed(1)}%\n`;
      historyContext += `  Total practice sessions completed: ${practiceSessions.length + 1}\n`;
      historyContext += '\nContext: This is a practice tracing mode for individuals with Parkinson\'s disease to work on motor control and precision. Unlike the relaxed Play mode, Practice mode tracks accuracy to help users see their improvement. Focus on celebrating progress in accuracy, consistency in practice, and the dedication to skill-building. Be encouraging about both the choice of practice topics and any improvements in performance.';

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
        setEncouragementMessage('Great work! Your practice session has been saved. Keep practicing to improve your motor skills!');
      }
    } catch (error) {
      console.error('Error fetching encouragement:', error);
      setEncouragementMessage('Great work! Your practice session has been saved. Keep practicing to improve your motor skills!');
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

  // Play audio when encouragement message is loaded
  useEffect(() => {
    if (encouragementMessage && showResults && !isLoadingEncouragement) {
      playCongratsMessage(encouragementMessage);
    }
  }, [encouragementMessage, showResults, isLoadingEncouragement]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setUploadedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File reader loaded, setting preview');
        setUploadedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  // Clear uploaded image
  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview('');
  };

  const generateImage = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      
      // If there's an uploaded image, send as multipart form data
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('image', uploadedImage);

        const response = await fetch(`${apiUrl}/generate`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fullImageUrl = `${apiUrl}${data.imageUrl}`;
        setGeneratedImageUrl(fullImageUrl);
        return fullImageUrl;
      } else {
        // Send as JSON for text-only requests
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
      }
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
      setProjectName(`Practice - ${topic}`);
      
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

  const handleSaveProject = async () => {
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
        time: finalTime, // Use finalTime instead of elapsedTime
        accuracy: finalAccuracy, // Use finalAccuracy instead of accuracy
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

            <div className="space-y-3">
              <Label className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Upload a Photo (Optional)
              </Label>
              
              {!uploadedImagePreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-gray-400 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      AI will create a practice page inspired by your photo
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={clearUploadedImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <Button
              onClick={handleStart}
              disabled={isGenerating || (!topic.trim() && !uploadedImage)}
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
              Practice mode: Trace carefully to improve motor control and accuracy
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
            <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3] flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              <Sparkles className="w-6 h-6 text-yellow-500" />
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
            
            {isLoadingEncouragement ? (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                  <p className="text-sm text-purple-600 dark:text-purple-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Generating personalized message...
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {encouragementMessage || 'Great work! Your practice session has been saved. Keep practicing to improve your motor skills!'}
                </p>
              </div>
            )}
            
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