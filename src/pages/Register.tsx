import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import sapsLogo from '@/assets/saps-logo.png';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    saId: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    anonymous: true,
    role: 'victim' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateSaId = (id: string): boolean => {
    if (id.length !== 13) return false;
    if (!/^\d+$/.test(id)) return false;
    
    // Luhn algorithm check
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      let digit = parseInt(id[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!validateSaId(formData.saId)) {
      newErrors.saId = 'Invalid South African ID number';
    }
    
    if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number (e.g., 0821234567)';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        saId: formData.saId,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        anonymous: formData.anonymous,
        role: formData.role,
      });
      navigate('/victim');
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg card-elevated animate-fade-in">
          <CardHeader className="text-center">
            <img 
              src={sapsLogo} 
              alt="SAPS Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <CardTitle className="font-heading text-2xl">Create Your Account</CardTitle>
            <CardDescription>Register to track your cases securely</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Anonymous Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Label htmlFor="anonymous" className="font-medium">Anonymous Mode</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>When enabled, your identity is hidden from police and the public. Only essential case information is shared.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anonymous: checked }))}
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'border-destructive' : ''}
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              {/* SA ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="saId">South African ID Number</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your 13-digit ID number. This is encrypted and never shared.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="saId"
                  name="saId"
                  type="text"
                  placeholder="8801015009087"
                  maxLength={13}
                  value={formData.saId}
                  onChange={handleChange}
                  className={errors.saId ? 'border-destructive' : ''}
                />
                {errors.saId && <p className="text-xs text-destructive">{errors.saId}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0821234567"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              {errors.submit && (
                <p className="text-sm text-destructive text-center">{errors.submit}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
