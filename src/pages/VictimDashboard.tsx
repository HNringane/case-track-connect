import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SafeExitButton } from '@/components/SafeExitButton';
import { CaseCard } from '@/components/CaseCard';
import { NewCaseModal } from '@/components/NewCaseModal';
import { VictimNotificationModal, VictimNotification } from '@/components/VictimNotificationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCases } from '@/data/mockCases';
import { Bell, Plus, LayoutGrid, List, FileText, Phone, Heart, ChevronRight } from 'lucide-react';
import sapsLogo from '@/assets/saps-logo.png';
import { 
  initializeCases, 
  getCasesByVictimId, 
  addCase, 
  subscribeToCase,
  getVictimNotifications,
  markVictimNotificationAsRead,
  subscribeToVictimNotifications
} from '@/stores/caseStore';

export default function VictimDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<VictimNotification | null>(null);
  const [userCases, setUserCases] = useState(getCasesByVictimId('1'));
  const [notifications, setNotifications] = useState<VictimNotification[]>(getVictimNotifications());
  
  // Initialize cases on mount
  useEffect(() => {
    initializeCases(mockCases);
    setUserCases(getCasesByVictimId('1'));
  }, []);

  // Subscribe to case updates
  useEffect(() => {
    const unsubscribeCases = subscribeToCase(() => {
      setUserCases(getCasesByVictimId('1'));
    });
    
    const unsubscribeNotifications = subscribeToVictimNotifications(() => {
      setNotifications(getVictimNotifications());
    });
    
    return () => {
      unsubscribeCases();
      unsubscribeNotifications();
    };
  }, []);

  const handleNewCase = (caseData: {
    type: string;
    province: string;
    city: string;
    location: string;
    description: string;
    anonymous: boolean;
    date: string;
  }) => {
    addCase({ ...caseData, victimId: '1' });
    setUserCases(getCasesByVictimId('1'));
  };

  const handleViewNotification = (notification: VictimNotification) => {
    setSelectedNotification(notification);
    setNotificationModalOpen(true);
  };

  const handleMarkAsRead = (id: number) => {
    markVictimNotificationAsRead(id);
    setNotifications(getVictimNotifications());
  };

  const resources = [
    { icon: Phone, title: 'Emergency Helpline', description: 'Call 10111 for immediate assistance', action: 'Call Now' },
    { icon: Heart, title: 'Victim Support', description: 'Free counseling and support services', action: 'Learn More' },
    { icon: FileText, title: 'Legal Aid', description: 'Access free legal assistance', action: 'Get Help' },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <SafeExitButton />
      
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
                Welcome Back
              </h1>
              <p className="opacity-90">
                You have {userCases.length} active cases. Here's your latest updates.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cases Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">My Cases</h2>
              <div className="flex items-center gap-2">
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <Button 
                  variant="gold" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setShowNewCaseModal(true)}
                >
                  <Plus className="w-4 h-4" /> New Case
                </Button>
              </div>
            </div>

            {/* Cases Grid/List */}
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
              {userCases.map((caseData) => (
                <CaseCard key={caseData.id} caseData={caseData} />
              ))}
            </div>

            {userCases.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-bold mb-2">No Cases Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't reported any cases yet. Start by reporting a new case.
                  </p>
                  <Button variant="gold" onClick={() => setShowNewCaseModal(true)}>
                    Report a New Case
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length > 0 ? notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg text-sm cursor-pointer hover:opacity-90 transition-opacity ${
                      notification.unread 
                        ? 'bg-primary/5 border-l-2 border-primary' 
                        : 'bg-muted'
                    }`}
                    onClick={() => handleViewNotification(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={notification.unread ? 'font-medium' : ''}>{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No notifications</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Resources */}
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource) => (
                  <div key={resource.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <resource.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{resource.title}</h4>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* New Case Modal */}
      <NewCaseModal 
        open={showNewCaseModal} 
        onOpenChange={setShowNewCaseModal}
        onCaseSubmitted={handleNewCase}
      />

      {/* Notification Detail Modal */}
      <VictimNotificationModal
        open={notificationModalOpen}
        onOpenChange={setNotificationModalOpen}
        notification={selectedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}
