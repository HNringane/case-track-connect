import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, MapPin, Shield, Eye, EyeOff } from 'lucide-react';

interface NewCaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseSubmitted?: (caseData: {
    type: string;
    province: string;
    city: string;
    location: string;
    description: string;
    anonymous: boolean;
    date: string;
  }) => void;
}

const caseTypes = [
  'Theft',
  'Assault',
  'Burglary',
  'Fraud',
  'Robbery',
  'Domestic Violence',
  'Vehicle Theft',
  'Vandalism',
  'Cybercrime',
  'Other'
];

const provinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape'
];

export function NewCaseModal({ open, onOpenChange, onCaseSubmitted }: NewCaseModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    caseType: '',
    province: '',
    city: '',
    location: '',
    description: '',
    anonymous: true,
    date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.caseType || !formData.province || !formData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const caseNumber = `CT-2024-${String(Math.floor(Math.random() * 9000) + 1000).padStart(6, '0')}`;
    
    // Notify parent component
    onCaseSubmitted?.({
      type: formData.caseType,
      province: formData.province,
      city: formData.city,
      location: formData.location,
      description: formData.description,
      anonymous: formData.anonymous,
      date: formData.date,
    });
    
    toast({
      title: 'Case Submitted Successfully',
      description: `Your case number is ${caseNumber}. You will receive updates on its progress.`,
    });
    
    setIsSubmitting(false);
    setFormData({
      caseType: '',
      province: '',
      city: '',
      location: '',
      description: '',
      anonymous: true,
      date: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <FileText className="w-5 h-5 text-primary" />
            Report a New Case
          </DialogTitle>
          <DialogDescription>
            Submit your case details below. All information is kept confidential and secure.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              {formData.anonymous ? (
                <EyeOff className="w-5 h-5 text-success" />
              ) : (
                <Eye className="w-5 h-5 text-warning" />
              )}
              <div>
                <Label className="font-medium">Report Anonymously</Label>
                <p className="text-xs text-muted-foreground">
                  {formData.anonymous 
                    ? 'Your identity will be hidden from officers' 
                    : 'Your identity will be visible to assigned officers'}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.anonymous}
              onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked })}
            />
          </div>

          {/* Case Type */}
          <div className="space-y-2">
            <Label htmlFor="caseType">Type of Case *</Label>
            <Select
              value={formData.caseType}
              onValueChange={(value) => setFormData({ ...formData, caseType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                {caseTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date of Incident */}
          <div className="space-y-2">
            <Label htmlFor="date">Date of Incident</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              Location Details
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City/Town</Label>
                <Input
                  id="city"
                  placeholder="e.g., Johannesburg"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Specific Location</Label>
              <Input
                id="location"
                placeholder="Street address or landmark"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Case Description *</Label>
            <Textarea
              id="description"
              placeholder="Please describe what happened. Include any relevant details that may help with the investigation."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters. Be as detailed as possible.
            </p>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary">Your information is secure</p>
              <p className="text-muted-foreground mt-1">
                All data is encrypted and protected. Only authorized officers can access case details.
              </p>
            </div>
          </div>

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
              variant="gold"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
