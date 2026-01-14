import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import sapsLogo from '@/assets/saps-logo.png';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="saps-header sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={sapsLogo} 
              alt="SAPS Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-tight">CaseTrack</span>
              <span className="text-xs opacity-80">SAPS Portal</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to={user?.role === 'victim' ? '/victim' : user?.role === 'police' ? '/police' : '/admin'} 
                  className="text-sm font-medium hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-accent/20 rounded-full capitalize">{user?.role}</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-accent transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="gold" size="sm">Register</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}