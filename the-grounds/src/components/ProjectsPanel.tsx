import { FolderOpen, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function ProjectsPanel() {
  // Mock projects data
  const projects = [
    {
      id: 1,
      name: 'Flower Drawing',
      type: 'Practice',
      date: '2025-10-18',
      thumbnail: null,
      accuracy: 87,
    },
    {
      id: 2,
      name: 'Spiral Test',
      type: 'Test',
      date: '2025-10-17',
      thumbnail: null,
      accuracy: 82,
    },
    {
      id: 3,
      name: 'Star Coloring',
      type: 'Play',
      date: '2025-10-16',
      thumbnail: null,
      accuracy: null,
    },
    {
      id: 4,
      name: 'Heart Practice',
      type: 'Practice',
      date: '2025-10-15',
      thumbnail: null,
      accuracy: 91,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Test':
        return 'bg-[#86b19c]';
      case 'Practice':
        return 'bg-[#fa9da6]';
      case 'Play':
        return 'bg-[#fff6a4]';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-[#86b19c]" style={{ fontFamily: 'Mansalva, cursive' }}>
        Projects
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <FolderOpen className="w-5 h-5" />
            Saved Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-gray-400" />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 style={{ fontFamily: 'Lexend, sans-serif' }}>{project.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-sm ${getTypeColor(project.type)} ${
                        project.type === 'Play' ? 'text-gray-700' : 'text-white'
                      }`}
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                      {project.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {project.date}
                  </p>
                  {project.accuracy !== null && (
                    <p className="text-sm text-[#86b19c]" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Accuracy: {project.accuracy}%
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                No saved projects yet. Start drawing to create your first project!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
