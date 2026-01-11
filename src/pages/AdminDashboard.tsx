import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockCases, stationStats, caseTypeStats, Case } from '@/data/mockCases';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Search,
  Activity
} from 'lucide-react';
import sapsLogo from '@/assets/saps-logo.png';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  initializeCases, 
  getCases, 
  subscribeToCase,
  escalateCase
} from '@/stores/caseStore';
import { useToast } from '@/hooks/use-toast';

const CHART_COLORS = ['hsl(210, 100%, 20%)', 'hsl(45, 100%, 50%)', 'hsl(174, 62%, 47%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

const monthlyData = [
  { month: 'Aug', cases: 145, resolved: 120 },
  { month: 'Sep', cases: 167, resolved: 134 },
  { month: 'Oct', cases: 189, resolved: 156 },
  { month: 'Nov', cases: 178, resolved: 167 },
  { month: 'Dec', cases: 203, resolved: 189 },
  { month: 'Jan', cases: 221, resolved: 198 },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [allCases, setAllCases] = useState<Case[]>([]);

  // Initialize cases on mount
  useEffect(() => {
    initializeCases(mockCases);
    setAllCases(getCases());
  }, []);

  // Subscribe to case updates
  useEffect(() => {
    const unsubscribe = subscribeToCase(() => {
      setAllCases(getCases());
    });
    return unsubscribe;
  }, []);

  const stalledCases = allCases.filter(c => c.statusLabel === 'Overdue');

  const stats = {
    totalCases: allCases.length,
    activeUsers: 1234,
    resolvedCases: allCases.filter(c => c.statusLabel === 'Completed').length,
    stalledCases: stalledCases.length,
    avgResolutionDays: 14,
    totalStations: stationStats.length,
  };

  const resourceAllocation = stationStats.map(s => ({
    station: s.station,
    officers: Math.floor(s.cases / 10),
    caseLoad: Math.round(s.cases / (s.cases / 10)),
    efficiency: Math.round((s.resolved / s.cases) * 100),
  }));

  const handleEscalate = (caseData: Case) => {
    const success = escalateCase(caseData.id);
    if (success) {
      toast({
        title: 'Case Escalated',
        description: `Case ${caseData.caseNumber} has been escalated for priority handling. The victim has been notified.`,
      });
      setAllCases(getCases());
    } else {
      toast({
        title: 'Error',
        description: 'Failed to escalate the case. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-primary text-primary-foreground rounded-xl p-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <img 
              src={sapsLogo} 
              alt="SAPS Logo" 
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-1">
                Admin Dashboard
              </h1>
              <p className="opacity-90">
                System-wide overview and management. {stats.stalledCases} stalled cases require attention.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Cases', value: stats.totalCases, icon: FileText, color: 'bg-primary' },
            { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'bg-accent' },
            { label: 'Resolved', value: stats.resolvedCases, icon: CheckCircle2, color: 'bg-success' },
            { label: 'Stalled', value: stats.stalledCases, icon: AlertTriangle, color: 'bg-destructive' },
            { label: 'Avg. Days', value: stats.avgResolutionDays, icon: Clock, color: 'bg-warning' },
            { label: 'Stations', value: stats.totalStations, icon: Settings, color: 'bg-muted' },
          ].map((stat, index) => (
            <Card key={stat.label} className="card-elevated animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="font-heading text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Monthly Trend */}
          <Card className="card-elevated lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Case Trends (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="hsl(210, 100%, 20%)" 
                    strokeWidth={2}
                    name="Reported"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="hsl(174, 62%, 47%)" 
                    strokeWidth={2}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Case Distribution */}
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Case Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={caseTypeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {caseTypeStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {caseTypeStats.slice(0, 4).map((item, index) => (
                  <div key={item.type} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CHART_COLORS[index] }}
                    />
                    <span>{item.type}: {item.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Stalled Cases Detection */}
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Stalled Cases ({stalledCases.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stalledCases.length > 0 ? stalledCases.map((caseData) => (
                  <div 
                    key={caseData.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <div>
                      <p className="font-medium text-sm">{caseData.caseNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {caseData.stationName} • Last update: {new Date(caseData.lastUpdate).toLocaleDateString('en-ZA')}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEscalate(caseData)}
                    >
                      Escalate
                    </Button>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No stalled cases</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resource Allocation */}
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Resource Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceAllocation.map((station) => (
                  <div key={station.station} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{station.station}</span>
                      <span className="text-muted-foreground">{station.officers} officers • {station.efficiency}% efficiency</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-bar-fill ${station.efficiency < 60 ? 'bg-destructive' : station.efficiency < 80 ? 'bg-warning' : 'bg-success'}`} 
                        style={{ width: `${station.efficiency}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Performance */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Station Performance
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search stations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stationStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="station" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" fill="hsl(210, 100%, 20%)" name="Total Cases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="hsl(174, 62%, 47%)" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
