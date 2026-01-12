import { Case } from '@/data/mockCases';
import { CaseTimeline } from '@/components/CaseTimeline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  Download,
  Clock,
  Shield
} from 'lucide-react';
import { downloadCaseReport } from '@/stores/caseStore';
import { useToast } from '@/hooks/use-toast';

interface CaseDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData: Case | null;
}

const statusColors = {
  'Completed': 'bg-success text-success-foreground',
  'In Progress': 'bg-warning text-warning-foreground',
  'Overdue': 'bg-destructive text-destructive-foreground',
};

const priorityColors = {
  high: 'bg-destructive/20 text-destructive border-destructive',
  medium: 'bg-warning/20 text-warning border-warning',
  low: 'bg-muted text-muted-foreground border-muted-foreground',
};

export function CaseDetailModal({ open, onOpenChange, caseData }: CaseDetailModalProps) {
  const { toast } = useToast();

  if (!caseData) return null;

  const handleDownloadReport = () => {
    downloadCaseReport(caseData);
    toast({
      title: 'Report Downloaded',
      description: `Case report for ${caseData.caseNumber} has been downloaded.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-heading text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {caseData.caseNumber}
              </DialogTitle>
              <DialogDescription className="text-base font-medium mt-1">
                {caseData.type}
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={statusColors[caseData.statusLabel]}>
                {caseData.statusLabel}
              </Badge>
              <Badge variant="outline" className={priorityColors[caseData.priority]}>
                {caseData.priority.toUpperCase()} Priority
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Case Info Grid */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Station</p>
              <p className="text-sm font-medium">{caseData.stationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Assigned Officer</p>
              <p className="text-sm font-medium">{caseData.officerAssigned || 'Pending Assignment'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium">
                {new Date(caseData.submittedDate).toLocaleDateString('en-ZA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">
                {new Date(caseData.lastUpdate).toLocaleDateString('en-ZA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Case Progress</span>
            <span className="font-medium">{caseData.progress}%</span>
          </div>
          <div className="progress-bar h-3">
            <div 
              className="progress-bar-fill transition-all duration-500" 
              style={{ width: `${caseData.progress}%` }}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Timeline Section */}
        <div>
          <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Case Timeline
          </h3>
          <div className="bg-muted/30 rounded-lg p-4">
            <CaseTimeline 
              updates={caseData.updates} 
              currentStatus={caseData.status} 
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownloadReport} className="gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}