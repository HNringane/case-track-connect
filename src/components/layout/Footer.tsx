import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import sapsLogo from '@/assets/saps-logo.png';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={sapsLogo} 
                alt="SAPS Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h3 className="font-heading font-bold text-lg">CaseTrack</h3>
                <p className="text-xs opacity-80">SAPS Portal</p>
              </div>
            </div>
            <p className="text-sm opacity-80 max-w-md">
              Empowering victims with real-time case tracking and transparent communication 
              with the South African Police Service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                  Report a Case
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.saps.gov.za" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  SAPS Website <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                  Victim Support
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-60">
            © {new Date().getFullYear()} CaseTrack. A civic-tech initiative in partnership with SAPS.
          </p>
        </div>
      </div>
    </footer>
  );
}
