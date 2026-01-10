import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UpdateCaseModal } from '@/components/UpdateCaseModal';
import { mockCases, stationStats, caseTypeStats, Case } from '@/data/mockCases';
import { 
  Search, 
  Filter, 
  Bell, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Users,
  Eye
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';

const statusColors = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'Overdue': 'status-overdue',
};

const priorityColors = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-muted text-muted-foreground',
};

const CHART_COLORS = ['hsl(210, 100%, 20%)', 'hsl(45, 100%, 50%)', 'hsl(174, 62%, 47%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(210, 20%, 60%)'];

export default function PoliceDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const filteredCases = mockCases.filter(c => {
    const matchesSearch = c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.statusLabel.toLowerCase().replace(' ', '-') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockCases.length,
    inProgress: mockCases.filter(c => c.statusLabel === 'In Progress').length,
    overdue: mockCases.filter(c => c.statusLabel === 'Overdue').length,
    resolved: mockCases.filter(c => c.statusLabel === 'Completed').length,
  };

  const notifications = [
    { id: 1, message: 'Case CT-2024-001156 is overdue by 5 days', type: 'warning', time: '1 hour ago' },
    { id: 2, message: 'New high-priority case assigned to you', type: 'alert', time: '3 hours ago' },
    { id: 3, message: 'Case CT-2024-001198 marked as resolved', type: 'success', time: '1 day ago' },
  ];

  const handleUpdateCase = (caseData: Case) => {
    setSelectedCase(caseData);
    setUpdateModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-primary text-primary-foreground rounded-xl p-6 mb-8 animate-fade-in">
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Police Officer Dashboard
          </h1>
          <p className="opacity-90">
            Manage and track your assigned cases. {stats.overdue} cases require immediate attention.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Cases', value: stats.total, icon: Users, color: 'bg-primary' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-warning' },
            { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-destructive' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'bg-success' },
          ].map((stat, index) => (
            <Card key={stat.label} className="card-elevated animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-heading text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by case number or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'in-progress', 'overdue', 'completed'].map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className="capitalize"
                      >
                        {status.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cases Table */}
            <Card className="card-elevated overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Assigned Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Case #</th>
                        <th className="text-left p-4 text-sm font-medium">Type</th>
                        <th className="text-left p-4 text-sm font-medium">Priority</th>
                        <th className="text-left p-4 text-sm font-medium">Status</th>
                        <th className="text-left p-4 text-sm font-medium">Last Update</th>
                        <th className="text-left p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((caseData) => (
                        <tr key={caseData.id} className="border-t hover:bg-muted/50 transition-colors">
                          <td className="p-4 text-sm font-medium">{caseData.caseNumber}</td>
                          <td className="p-4 text-sm">{caseData.type}</td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${priorityColors[caseData.priority]}`}>
                              {caseData.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`status-badge ${statusColors[caseData.statusLabel]}`}>
                              {caseData.statusLabel}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(caseData.lastUpdate).toLocaleDateString('en-ZA')}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateCase(caseData)}
                              >
                                Update
                              </Button>
                              <Link to={`/case/${caseData.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Station Performance */}
              <Card className="card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5" />
                    Cases by Station
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stationStats.slice(0, 4)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="station" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="cases" fill="hsl(210, 100%, 20%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Case Types */}
              <Card className="card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Cases by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={caseTypeStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        label={({ type, percentage }) => `${type} ${percentage}%`}
                        labelLine={false}
                      >
                        {caseTypeStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5" />
                  Alerts
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg text-sm border-l-2 ${
                      notification.type === 'warning' ? 'bg-warning/10 border-warning' :
                      notification.type === 'alert' ? 'bg-destructive/10 border-destructive' :
                      'bg-success/10 border-success'
                    }`}
                  >
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Resolution Rate</span>
                    <span className="font-medium">{Math.round((stats.resolved / stats.total) * 100)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${(stats.resolved / stats.total) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg. Resolution Time</span>
                    <span className="font-medium">14 days</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-warning" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cases Updated Today</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-primary" style={{ width: '75%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Update Case Modal */}
      <UpdateCaseModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        caseData={selectedCase}
      />
    </div>
  );
}