import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export interface VictimNotification {
  id: number;
  caseNumber: string;
  message: string;
  time: string;
  unread: boolean;
  details?: string;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: string;
}

interface VictimNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: VictimNotification | null;
  onMarkAsRead: (id: number) => void;
}

const priorityConfig = {
  low: { color: 'bg-muted text-muted-foreground', label: 'Low Priority' },
  medium: { color: 'bg-warning/20 text-warning', label: 'Medium Priority' },
  high: { color: 'bg-destructive/20 text-destructive', label: 'High Priority' },
};

export function VictimNotificationModal({ 
  open, 
  onOpenChange, 
  notification,
  onMarkAsRead
}: VictimNotificationModalProps) {
  if (!notification) return null;

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <DialogTitle className="font-heading">Notification Details</DialogTitle>
          </div>
          <DialogDescription>
            {notification.time}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Priority Badge */}
          {notification.priority && (
            <Badge className={priorityConfig[notification.priority].color}>
              {priorityConfig[notification.priority].label}
            </Badge>
          )}
          
          {/* Case Number */}
          {notification.caseNumber && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Case:</span>
              <span className="font-medium">{notification.caseNumber}</span>
            </div>
          )}
          
          {/* Message */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="font-medium">{notification.message}</p>
          </div>
          
          {/* Details */}
          {notification.details && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Details
              </h4>
              <p className="text-sm text-muted-foreground">{notification.details}</p>
            </div>
          )}
          
          {/* Action Required */}
          {notification.actionRequired && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="text-sm font-medium text-primary mb-1">Action Required</h4>
              <p className="text-sm">{notification.actionRequired}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {notification.unread && (
              <Button 
                variant="default" 
                className="flex-1 gap-2"
                onClick={handleMarkAsRead}
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Read
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
