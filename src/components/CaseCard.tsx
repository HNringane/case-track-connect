import { Case } from '@/data/mockCases';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Download } from 'lucide-react';
import { downloadCaseReport } from '@/stores/caseStore';
import { useToast } from '@/hooks/use-toast';

interface CaseCardProps {
  caseData: Case;
}

const statusColors = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Overdue': 'status-overdue',
};

const stages = ['Submitted', 'Under Review', 'Investigation', 'Resolution'];

export function CaseCard({ caseData }: CaseCardProps) {
  const { toast } = useToast();

  const handleDownloadReport = () => {
    downloadCaseReport(caseData);
    toast({
      title: 'Report Downloaded',
      description: `Case report for ${caseData.caseNumber} has been downloaded.`,
    });
  };

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{caseData.caseNumber}</p>
            <h3 className="font-heading font-bold text-lg mt-1">{caseData.type}</h3>
          </div>
          <span className={`status-badge ${statusColors[caseData.statusLabel]}`}>
            {caseData.statusLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Station Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{caseData.stationName}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            {stages.map((stage, index) => (
              <span 
                key={stage} 
                className={index <= Math.floor(caseData.progress / 25) ? 'text-foreground font-medium' : ''}
              >
                {stage}
              </span>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${caseData.progress}%` }}
            />
          </div>
        </div>

        {/* Last Update & Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Updated {new Date(caseData.lastUpdate).toLocaleDateString('en-ZA')}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={handleDownloadReport}
          >
            <Download className="w-4 h-4" /> Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
