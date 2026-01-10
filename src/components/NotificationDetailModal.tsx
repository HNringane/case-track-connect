import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock, Bell, X } from 'lucide-react';

export interface Notification {
  id: number;
  message: string;
  type: 'warning' | 'alert' | 'success' | 'info';
  time: string;
  details?: string;
  caseNumber?: string;
  priority?: 'high' | 'medium' | 'low';
  actionRequired?: string;
}

interface NotificationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: Notification | null;
  onMarkAsRead?: (id: number) => void;
  onTakeAction?: (id: number) => void;
}

export function NotificationDetailModal({ 
  open, 
  onOpenChange, 
  notification,
  onMarkAsRead,
  onTakeAction
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <Clock className="w-6 h-6 text-warning" />;
      case 'alert':
        return <AlertTriangle className="w-6 h-6 text-destructive" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      default:
        return <Bell className="w-6 h-6 text-primary" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'warning':
        return 'bg-warning/10 border-warning';
      case 'alert':
        return 'bg-destructive/10 border-destructive';
      case 'success':
        return 'bg-success/10 border-success';
      default:
        return 'bg-primary/10 border-primary';
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'warning':
        return 'Warning';
      case 'alert':
        return 'High Priority Alert';
      case 'success':
        return 'Resolved';
      default:
        return 'Information';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getBgColor()}`}>
              {getIcon()}
            </div>
            <span>Notification Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant={notification.type === 'alert' ? 'destructive' : 
                       notification.type === 'warning' ? 'secondary' : 
                       'default'}
            >
              {getTypeLabel()}
            </Badge>
            {notification.priority && (
              <Badge 
                variant="outline" 
                className={notification.priority === 'high' ? 'border-destructive text-destructive' :
                           notification.priority === 'medium' ? 'border-warning text-warning' :
                           'border-muted-foreground'}
              >
                {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
              </Badge>
            )}
          </div>

          <div className={`p-4 rounded-lg border-l-4 ${getBgColor()}`}>
            <p className="font-medium">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
          </div>

          {notification.caseNumber && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Related Case</p>
              <p className="font-medium">{notification.caseNumber}</p>
            </div>
          )}

          {notification.details && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Details</p>
              <p className="text-sm">{notification.details}</p>
            </div>
          )}

          {notification.actionRequired && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-muted-foreground mb-1">Action Required</p>
              <p className="text-sm font-medium">{notification.actionRequired}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {notification.actionRequired && onTakeAction && (
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => {
                  onTakeAction(notification.id);
                  onOpenChange(false);
                }}
              >
                Take Action
              </Button>
            )}
            {onMarkAsRead && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onOpenChange(false);
                }}
              >
                Mark as Read
              </Button>
            )}
            <Button 
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
