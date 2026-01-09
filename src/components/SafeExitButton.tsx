import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function SafeExitButton() {
  const handleSafeExit = () => {
    // Clear any sensitive data from session
    sessionStorage.clear();
    // Redirect to a safe, innocuous website
    window.location.href = 'https://www.google.com';
  };

  return (
    <Button
      variant="safeExit"
      size="sm"
      onClick={handleSafeExit}
      className="safe-exit-button"
    >
      <X className="w-4 h-4 mr-1" />
      Safe Exit
    </Button>
  );
}
