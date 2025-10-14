import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-soft">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center gradient-soft px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Smile Dental
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Professional Dental Clinic Management System
        </p>
        <p className="text-lg text-muted-foreground mb-8">
          Streamline your dental practice with our comprehensive management solution
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/auth')}
          className="text-lg px-8 py-6 shadow-card hover:shadow-lg transition-smooth"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
