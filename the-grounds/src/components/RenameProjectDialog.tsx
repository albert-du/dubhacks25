import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

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

interface RenameProjectDialogProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: number, newName: string) => void;
}

export function RenameProjectDialog({ project, open, onClose, onSave }: RenameProjectDialogProps) {
  const [newName, setNewName] = useState('');

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && project) {
      setNewName(project.name);
    } else {
      setNewName('');
      onClose();
    }
  };

  const handleSave = () => {
    if (project && newName.trim()) {
      onSave(project.id, newName.trim());
      onClose();
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#527a62] dark:text-[#9cc9b3]" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '700' }}>
            Rename Project
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="rename-input" className="dark:text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Project Name
            </Label>
            <Input
              id="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              style={{ fontFamily: 'Lexend, sans-serif' }}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!newName.trim()}
              className="flex-1 bg-[#86b19c] hover:bg-[#6d9a84] dark:bg-primary dark:hover:bg-primary/90"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
