import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  FileText, 
  Search, 
  Heart, 
  Shield, 
  Users, 
  Clock,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import sapsLogo from '@/assets/saps-logo.png';

const stats = [
  { value: '50,000+', label: 'Cases Tracked' },
  { value: '87%', label: 'Resolution Rate' },
  { value: '24/7', label: 'Access' },
  { value: '100%', label: 'Secure' },
];

const steps = [
  {
    icon: FileText,
    title: 'Submit Your Case',
    description: 'Report incidents securely with optional anonymous mode to protect your identity.',
  },
  {
    icon: Search,
    title: 'Track Progress',
    description: 'Monitor your case through every stage from submission to resolution.',
  },
  {
    icon: Heart,
    title: 'Access Resources',
    description: 'Connect with victim support services and legal resources when you need them.',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Privacy Protected',
    description: 'Your identity can remain anonymous. All data is encrypted and secured.',
  },
  {
    icon: Users,
    title: 'Direct Communication',
    description: 'Stay connected with assigned officers without revealing personal information.',
  },
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Receive instant notifications when your case status changes.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <img 
              src={sapsLogo} 
              alt="SAPS Logo" 
              className="w-24 h-24 mx-auto mb-6 object-contain"
            />
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Track your case.{' '}
              <span className="text-accent">Stay informed.</span>{' '}
              Stay safe.
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              CaseTrack empowers victims by providing real-time updates on reported crimes, 
              ensuring transparency and accountability in the justice process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="hero" size="xl">
                  Login to Your Account
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="heroOutline" size="xl">
                  Report a New Case
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="font-heading text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to track your case and access the support you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={step.title} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h3 className="font-heading text-xl font-bold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Why CaseTrack Matters</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transparency builds trust. CaseTrack bridges the gap between victims and the justice system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-elevated animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 mb-4 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Victim Support */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-primary p-8 text-primary-foreground">
                <h3 className="font-heading text-2xl font-bold mb-4">Need Support?</h3>
                <p className="opacity-90 mb-6">
                  CaseTrack connects you with victim support resources, counseling services, 
                  and legal aid organizations across South Africa.
                </p>
                <ul className="space-y-3">
                  {['24/7 Helpline Access', 'Counseling Services', 'Legal Aid Resources', 'Safe Spaces Directory'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <h4 className="font-heading text-xl font-bold mb-2">Emergency Contacts</h4>
                <div className="space-y-3 mb-6">
                  <p className="text-sm">
                    <span className="font-semibold">SAPS Emergency:</span>{' '}
                    <a href="tel:10111" className="text-primary hover:underline">10111</a>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">GBV Command Centre:</span>{' '}
                    <a href="tel:0800428428" className="text-primary hover:underline">0800 428 428</a>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">LifeLine SA:</span>{' '}
                    <a href="tel:0861322322" className="text-primary hover:underline">0861 322 322</a>
                  </p>
                </div>
                <Button variant="default" className="w-fit gap-2">
                  View All Resources <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Track Your Case?
          </h2>
          <p className="opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of South Africans who use CaseTrack to stay informed about their reported cases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="hero" size="lg">
                Get Started Now
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="heroOutline" size="lg">
                Already Have an Account?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
