import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStrategyModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createNewStrategy } = useStrategyStore();

  const handleCreate = () => {
    if (!name.trim()) return;
    createNewStrategy(name, description);
    onClose();
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle>Create New Strategy</DialogTitle>
          </div>
        </DialogHeader>

        <Card className="border-border bg-card">
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="name">Strategy Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Qualify Leads"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                placeholder="Describe what this strategy does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-20 resize-none text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Strategy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
