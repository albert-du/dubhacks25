import { useEffect, useState } from 'react';
import { FolderOpen, Trash2, Edit2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { ProjectViewer } from './ProjectViewer';

interface Project {
  id: number;
  name: string;
  type: string;
  date: string;
  timeOfDay?: string;
  thumbnail: string | null;
  time?: number;
  accuracy?: number | null;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  };

  const handleDelete = (id: number) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const handleView = (project: Project) => {
    setSelectedProject(project);
    setViewerOpen(true);
  };

  const handleEditName = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
  };

  const handleSaveEdit = () => {
    if (editingProject && editName.trim()) {
      const updatedProjects = projects.map(p =>
        p.id === editingProject.id ? { ...p, name: editName } : p
      );
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setEditingProject(null);
      setEditName('');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Test':
        return 'bg-[#86b19c] dark:bg-[#9cc9b3]';
      case 'Practice':
        return 'bg-[#fa9da6] dark:bg-[#e88a95]';
      case 'Play':
        return 'bg-[#fff6a4] dark:bg-[#f4ed94]';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#f0d5d8] to-[#e5c4c9] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#2a2020] dark:to-[#2a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="border-4 border-[#86b19c] dark:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-4xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              <FolderOpen className="w-8 h-8" />
              My Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  No projects yet. Start by completing a Test, Practice, or Play session!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border-2 rounded-lg p-4 hover:shadow-lg transition-all bg-white dark:bg-card dark:border-border"
                  >
                    {/* Thumbnail */}
                    <div 
                      className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleView(project)}
                    >
                      {project.thumbnail ? (
                        <img 
                          src={project.thumbnail} 
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 
                          className="text-[#527a62] dark:text-[#9cc9b3] truncate flex-1 cursor-pointer hover:underline" 
                          style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '600' }}
                          onClick={() => handleView(project)}
                        >
                          {project.name}
                        </h3>
                        <Button
                          onClick={() => handleEditName(project)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getTypeColor(project.type)} text-gray-800 dark:text-gray-900`} style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '600' }}>
                          {project.type}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                          {project.date}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#f3e2c6] dark:bg-muted rounded p-2">
                          <p className="text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Time</p>
                          <p className="text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '600' }}>
                            {formatTime(project.time)}
                          </p>
                        </div>
                        {project.accuracy !== null && project.accuracy !== undefined && (
                          <div className="bg-[#f3e2c6] dark:bg-muted rounded p-2">
                            <p className="text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Accuracy</p>
                            <p className="text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '600' }}>
                              {project.accuracy.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleView(project)}
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          style={{ fontFamily: 'Lexend, sans-serif' }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDelete(project.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          style={{ fontFamily: 'Lexend, sans-serif' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Viewer */}
      <ProjectViewer
        project={selectedProject}
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedProject(null);
        }}
      />

      {/* Edit Name Dialog */}
      <Dialog open={editingProject !== null} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              Rename Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Project Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter new name"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setEditingProject(null)}
                variant="outline"
                className="flex-1"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editName.trim()}
                className="flex-1 bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
