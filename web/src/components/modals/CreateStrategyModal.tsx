import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Create New Strategy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-300">Strategy Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Qualify Leads"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">Description (optional)</Label>
            <textarea
              id="description"
              placeholder="Describe what this strategy does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 h-20 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-100">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()} className="bg-blue-600 hover:bg-blue-700">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
