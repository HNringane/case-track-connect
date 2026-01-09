import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SafeExitButton } from '@/components/SafeExitButton';
import { CaseTimeline } from '@/components/CaseTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCases } from '@/data/mockCases';
import { ArrowLeft, MapPin, Calendar, User, Phone, FileText, ExternalLink } from 'lucide-react';

const statusColors = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Overdue': 'status-overdue',
};

export default function CaseDetails() {
  const { id } = useParams();
  const caseData = mockCases.find(c => c.id === id);

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="text-center p-8">
            <h2 className="font-heading text-xl font-bold mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist.</p>
            <Link to="/victim">
              <Button>Back to Dashboard</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const stages = ['Submitted', 'Under Review', 'Investigation', 'Resolution'];

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <SafeExitButton />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/victim" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Case Header */}
        <div className="bg-card rounded-xl p-6 mb-6 card-elevated animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading text-2xl font-bold">{caseData.caseNumber}</h1>
                <span className={`status-badge ${statusColors[caseData.statusLabel]}`}>
                  {caseData.statusLabel}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">{caseData.type}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="w-4 h-4" /> Download Report
              </Button>
              <Button variant="default" size="sm" className="gap-1">
                <Phone className="w-4 h-4" /> Contact Officer
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              {stages.map((stage, index) => (
                <span 
                  key={stage} 
                  className={index <= Math.floor(caseData.progress / 25) ? 'text-foreground font-medium' : 'text-muted-foreground'}
                >
                  {stage}
                </span>
              ))}
            </div>
            <div className="progress-bar h-3">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${caseData.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{caseData.progress}% Complete</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseTimeline updates={caseData.updates} currentStatus={caseData.status} />
              </CardContent>
            </Card>
          </div>

          {/* Case Info Sidebar */}
          <div className="space-y-6">
            {/* Case Details */}
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Station</p>
                    <p className="text-sm text-muted-foreground">{caseData.stationName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Assigned Officer</p>
                    <p className="text-sm text-muted-foreground">{caseData.officerAssigned || 'Not yet assigned'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(caseData.submittedDate).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Resources */}
            <Card className="card-elevated bg-primary text-primary-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Need Support?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm opacity-90">
                  If you're feeling overwhelmed, help is available 24/7.
                </p>
                <div className="space-y-2">
                  <a href="tel:0800428428" className="flex items-center gap-2 text-sm hover:text-accent transition-colors">
                    <Phone className="w-4 h-4" />
                    GBV Helpline: 0800 428 428
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm hover:text-accent transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Victim Support Resources
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {caseData.status === 'investigation' && 
                    'The investigating officer is currently gathering evidence. You may be contacted for additional information.'}
                  {caseData.status === 'under-review' && 
                    'Your case is being reviewed by a detective. A dedicated officer will be assigned shortly.'}
                  {caseData.status === 'resolution' && 
                    'Your case is in the final stages. Expect a resolution update within 5-7 business days.'}
                  {caseData.status === 'completed' && 
                    'This case has been resolved. You can download the final report for your records.'}
                  {caseData.status === 'submitted' && 
                    'Your case has been received. It will be reviewed within 24-48 hours.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
