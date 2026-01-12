import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SafeExitButton } from '@/components/SafeExitButton';
import { CaseCard } from '@/components/CaseCard';
import { NewCaseModal } from '@/components/NewCaseModal';
import { VictimNotificationModal } from '@/components/VictimNotificationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Plus, LayoutGrid, List, FileText, Phone, Heart, ChevronRight, Loader2 } from 'lucide-react';
import sapsLogo from '@/assets/saps-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Case,
  fetchVictimCases,
  createCase,
  fetchNotifications,
  markNotificationAsRead,
  subscribeToCases,
  subscribeToNotifications,
} from '@/services/caseService';

interface Notification {
  id: string;
  case_number: string | null;
  message: string;
  details: string | null;
  priority: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
}

export default function VictimDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [userCases, setUserCases] = useState<Case[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch cases and notifications on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [cases, notifs] = await Promise.all([
          fetchVictimCases(user.id),
          fetchNotifications(user.id),
        ]);
        setUserCases(cases);
        setNotifications(notifs);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your cases. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribeCases = subscribeToCases(async () => {
      const cases = await fetchVictimCases(user.id);
      setUserCases(cases);
    });

    const unsubscribeNotifications = subscribeToNotifications(user.id, async () => {
      const notifs = await fetchNotifications(user.id);
      setNotifications(notifs);
      toast({
        title: 'New Update',
        description: 'You have a new case update.',
      });
    });

    return () => {
      unsubscribeCases();
      unsubscribeNotifications();
    };
  }, [user?.id, toast]);

  const handleNewCase = async (caseData: {
    type: string;
    province: string;
    city: string;
    location: string;
    description: string;
    anonymous: boolean;
    date: string;
  }) => {
    if (!user?.id) return;

    try {
      await createCase(user.id, caseData);
      const cases = await fetchVictimCases(user.id);
      setUserCases(cases);
      toast({
        title: 'Case Submitted',
        description: 'Your case has been submitted successfully.',
      });
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit case. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setNotificationModalOpen(true);
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const resources = [
    { icon: Phone, title: 'Emergency Helpline', description: 'Call 10111 for immediate assistance', action: 'Call Now' },
    { icon: Heart, title: 'Victim Support', description: 'Free counseling and support services', action: 'Learn More' },
    { icon: FileText, title: 'Legal Aid', description: 'Access free legal assistance', action: 'Get Help' },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Convert database notification to modal format
  const formatNotificationForModal = (notification: Notification | null) => {
    if (!notification) return null;
    return {
      id: parseInt(notification.id) || 0,
      caseNumber: notification.case_number || '',
      message: notification.message,
      time: new Date(notification.created_at).toLocaleString('en-ZA'),
      unread: !notification.is_read,
      details: notification.details || undefined,
      priority: notification.priority as 'low' | 'medium' | 'high' | undefined,
    };
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                Welcome Back{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="opacity-90">
                You have {userCases.length} active case{userCases.length !== 1 ? 's' : ''}. Here's your latest updates.
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
                <CaseCard key={caseData.id} caseData={caseData as any} />
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
                {notifications.length > 0 ? notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg text-sm cursor-pointer hover:opacity-90 transition-opacity ${
                      !notification.is_read 
                        ? 'bg-primary/5 border-l-2 border-primary' 
                        : 'bg-muted'
                    }`}
                    onClick={() => handleViewNotification(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={!notification.is_read ? 'font-medium' : ''}>{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString('en-ZA')}
                        </p>
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
        notification={formatNotificationForModal(selectedNotification)}
        onMarkAsRead={(id) => handleMarkAsRead(String(id))}
      />
    </div>
  );
}