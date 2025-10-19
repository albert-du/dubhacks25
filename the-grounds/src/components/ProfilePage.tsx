import { useState, useEffect } from 'react';
import { User, Calendar as CalendarIcon, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar as CalendarComponent } from './ui/calendar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ProjectViewer } from './ProjectViewer';
import { RenameProjectDialog } from './RenameProjectDialog';

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

export function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDateProjects, setSelectedDateProjects] = useState<Project[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  useEffect(() => {
    // Load user info from localStorage
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);

    // Load projects from localStorage
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  };

  useEffect(() => {
    // Filter projects by selected date
    if (date && projects.length > 0) {
      const dateStr = date.toISOString().split('T')[0];
      const filtered = projects.filter(p => p.date === dateStr);
      setSelectedDateProjects(filtered);
    } else {
      setSelectedDateProjects([]);
    }
  }, [date, projects]);

  const handleEditProfile = () => {
    setTempName(name);
    setTempEmail(email);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (tempName.trim() && tempEmail.trim()) {
      setName(tempName);
      setEmail(tempEmail);
      localStorage.setItem('userName', tempName);
      localStorage.setItem('userEmail', tempEmail);
      setIsEditingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setTempName('');
    setTempEmail('');
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewerOpen(true);
  };
  
  const handleRenameProject = (id: number, newName: string) => {
    const updatedProjects = projects.map(p =>
      p.id === id ? { ...p, name: newName } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    loadProjects();
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  // Prepare time chart data
  const timeChartData = projects.reduce((acc: any[], project) => {
    const existing = acc.find(item => item.date === project.date);
    const timeInMinutes = project.time ? Math.floor(project.time / 60) : 0;
    
    if (existing) {
      existing.time += timeInMinutes;
    } else {
      acc.push({
        date: project.date,
        time: timeInMinutes,
      });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date)).slice(-7); // Last 7 days

  // Prepare accuracy chart data (only for projects with accuracy)
  const accuracyChartData = projects
    .filter(p => p.accuracy !== null && p.accuracy !== undefined)
    .reduce((acc: any[], project) => {
      const existing = acc.find(item => item.date === project.date);
      
      if (existing) {
        existing.totalAccuracy += project.accuracy!;
        existing.count += 1;
        existing.accuracy = Math.round(existing.totalAccuracy / existing.count);
      } else {
        acc.push({
          date: project.date,
          accuracy: Math.round(project.accuracy!),
          totalAccuracy: project.accuracy!,
          count: 1,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days

  // Calculate dates with activities for calendar highlighting
  const datesWithActivities = projects.map(p => new Date(p.date + 'T00:00:00'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#f0d5d8] to-[#e5c4c9] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#2a2020] dark:to-[#2a1a1a] p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-4xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
          My Profile
        </h2>

        {/* User Profile Card */}
        <Card className="border-4 border-[#86b19c] dark:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </div>
              {!isEditingProfile && (
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {isEditingProfile ? (
                <>
                  <div>
                    <Label htmlFor="edit-name" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Your name"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Email
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={!tempName.trim() || !tempEmail.trim()}
                      className="gap-2 bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                      <Check className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="gap-2"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Name</Label>
                    <p className="text-lg text-gray-800 dark:text-foreground mt-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      {name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Email</Label>
                    <p className="text-lg text-gray-800 dark:text-foreground mt-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      {email || 'Not set'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts Container: Practice Time Chart and Accuracy Chart side-by-side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Practice Time Chart */}
          <Card className="border-4 border-[#86b19c] dark:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
                <TrendingUp className="w-5 h-5" />
                Practice Time History (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#527a62"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    />
                    <YAxis 
                      stroke="#527a62"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                      label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontFamily: 'Lexend, sans-serif' } }}
                    />
                    <Tooltip 
                      contentStyle={{ fontFamily: 'Lexend, sans-serif', backgroundColor: '#fff', border: '2px solid #86b19c' }}
                    />
                    <Bar dataKey="time" fill="#86b19c" name="Practice Time (min)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    No practice data yet. Complete some sessions to see your progress!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accuracy Chart */}
          <Card className="border-4 border-[#fa9da6] dark:border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
                <TrendingUp className="w-5 h-5" />
                Accuracy Progress (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accuracyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={accuracyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#527a62"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    />
                    <YAxis 
                      stroke="#527a62"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                      domain={[0, 100]}
                      label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Lexend, sans-serif' } }}
                    />
                    <Tooltip 
                      contentStyle={{ fontFamily: 'Lexend, sans-serif', backgroundColor: '#fff', border: '2px solid #fa9da6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#fa9da6" 
                      strokeWidth={3}
                      name="Accuracy (%)"
                      dot={{ fill: '#fa9da6', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    No accuracy data yet. Complete Test or Practice sessions to track your accuracy!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar and Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="border-4 border-[#86b19c] dark:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
                <CalendarIcon className="w-5 h-5" />
                Activity Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border dark:border-border"
                modifiers={{
                  hasActivity: datesWithActivities,
                }}
                modifiersStyles={{
                  hasActivity: {
                    backgroundColor: '#86b19c',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Date Projects */}
          <Card className="border-4 border-[#fa9da6] dark:border-secondary">
            <CardHeader>
              <CardTitle className="text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
                {date ? date.toLocaleDateString() : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateProjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    No activity on this date
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateProjects.map((project) => (
                    <div
                      key={project.id}
                      className="border-2 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-card dark:border-border"
                      onClick={() => handleViewProject(project)}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded flex-shrink-0 overflow-hidden">
                          {project.thumbnail ? (
                            <img 
                              src={project.thumbnail} 
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                              N/A
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#527a62] dark:text-[#9cc9b3] truncate" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '600' }}>
                            {project.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              project.type === 'Test' ? 'bg-[#86b19c]' : 
                              project.type === 'Practice' ? 'bg-[#fa9da6]' : 
                              'bg-[#fff6a4]'
                            } text-gray-800`} style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '600' }}>
                              {project.type}
                            </span>
                            {project.timeOfDay && (
                              <span className="text-xs text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                {project.timeOfDay}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-gray-600 dark:text-muted-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            <span>⏱ {formatTime(project.time)}</span>
                            {project.accuracy !== null && project.accuracy !== undefined && (
                              <span>📊 {project.accuracy.toFixed(1)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
      
      {/* Rename Project Dialog */}
      <RenameProjectDialog
        project={renamingProject}
        open={renameDialogOpen}
        onClose={() => {
          setRenameDialogOpen(false);
          setRenamingProject(null);
        }}
        onSave={handleRenameProject}
      />
    </div>
  );
}