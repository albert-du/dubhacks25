import { Share2, Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Project {
  id: number;
  name: string;
  type: string;
  date: string;
  time?: number;
  timeOfDay?: string;
  accuracy?: number | null;
  thumbnail: string | null;
}

interface ProjectViewerProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectViewer({ project, open, onClose }: ProjectViewerProps) {
  if (!project) return null;

  const handleShare = async () => {
    if (project.thumbnail) {
      try {
        const blob = await fetch(project.thumbnail).then(r => r.blob());
        const file = new File([blob], `${project.name}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: project.name,
            text: `Check out my ${project.type} project!`,
          });
        } else {
          // Fallback: download
          handleDownload();
        }
      } catch (error) {
        console.error('Error sharing:', error);
        handleDownload();
      }
    }
  };

  const handleDownload = () => {
    if (project.thumbnail) {
      const link = document.createElement('a');
      link.href = project.thumbnail;
      link.download = `${project.name}.png`;
      link.click();
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
            {project.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Project Image */}
          <div className="bg-white dark:bg-card rounded-lg overflow-hidden border-2 border-gray-200 dark:border-border">
            {project.thumbnail ? (
              <img 
                src={project.thumbnail} 
                alt={project.name}
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500" style={{ fontFamily: 'Lexend, sans-serif' }}>No preview available</p>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Type
              </p>
              <p className="text-lg font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                {project.type}
              </p>
            </div>
            <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Date
              </p>
              <p className="text-lg font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                {project.date}
              </p>
            </div>
            <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Time of Day
              </p>
              <p className="text-lg font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                {project.timeOfDay || 'N/A'}
              </p>
            </div>
            <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Duration
              </p>
              <p className="text-lg font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                {formatTime(project.time)}
              </p>
            </div>
            {project.accuracy !== null && project.accuracy !== undefined && (
              <div className="bg-[#f3e2c6] dark:bg-muted rounded-lg p-4 col-span-2">
                <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {project.accuracy.toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              className="flex-1 bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90 gap-2"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 gap-2"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
