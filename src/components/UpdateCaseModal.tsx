import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Case, CaseStatus } from '@/data/mockCases';
import { FileEdit, AlertCircle } from 'lucide-react';

interface UpdateCaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData: Case | null;
  onCaseUpdated?: () => void;
}

const statusOptions: { value: CaseStatus; label: string; description: string }[] = [
  { value: 'submitted', label: 'Submitted', description: 'Case has been received' },
  { value: 'under-review', label: 'Under Review', description: 'Case is being reviewed by an officer' },
  { value: 'investigation', label: 'Investigation', description: 'Active investigation in progress' },
  { value: 'resolution', label: 'Resolution', description: 'Case is being resolved' },
  { value: 'completed', label: 'Completed', description: 'Case has been closed' },
];

export function UpdateCaseModal({ open, onOpenChange, caseData, onCaseUpdated }: UpdateCaseModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: caseData?.status || 'submitted',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.notes.trim()) {
      toast({
        title: 'Note Required',
        description: 'Please add a note describing the update.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Case Updated',
      description: `Case ${caseData?.caseNumber} has been updated successfully.`,
    });
    
    setIsSubmitting(false);
    setFormData({ status: 'submitted', notes: '' });
    onOpenChange(false);
    onCaseUpdated?.();
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <FileEdit className="w-5 h-5 text-primary" />
            Update Case
          </DialogTitle>
          <DialogDescription>
            Update the status and add notes for case {caseData.caseNumber}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Case Info */}
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Case Number</span>
              <span className="text-sm font-medium">{caseData.caseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm font-medium">{caseData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Status</span>
              <span className={`text-sm font-medium status-badge ${
                caseData.statusLabel === 'Completed' ? 'status-completed' :
                caseData.statusLabel === 'Overdue' ? 'status-overdue' : 'status-in-progress'
              }`}>
                {caseData.statusLabel}
              </span>
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Update Stage</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as CaseStatus })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Update Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Update Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Describe the update or actions taken..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This note will be visible to the victim in their case timeline.
            </p>
          </div>

          {/* Warning for completion */}
          {formData.status === 'completed' && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Closing this case</p>
                <p className="text-muted-foreground mt-1">
                  Marking as completed will close the case. Ensure all necessary actions have been taken.
                </p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}