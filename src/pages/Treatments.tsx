import { useEffect, useState } from 'react';
import { devError } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { AddTreatmentDialog } from '@/components/treatments/AddTreatmentDialog';

export default function Treatments() {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      
      // Since we don't have a treatments table yet, let's create mock data
      // In production, this would fetch from a real treatments table
      const mockTreatments = [
        {
          id: '1',
          name: 'Teeth Cleaning',
          description: 'Professional teeth cleaning and polishing',
          duration: 30,
          cost: 150,
          category: 'Preventive',
        },
        {
          id: '2',
          name: 'Dental Filling',
          description: 'Composite resin filling for cavity treatment',
          duration: 60,
          cost: 300,
          category: 'Restorative',
        },
        {
          id: '3',
          name: 'Root Canal',
          description: 'Endodontic treatment to save infected tooth',
          duration: 90,
          cost: 1200,
          category: 'Endodontic',
        },
        {
          id: '4',
          name: 'Teeth Whitening',
          description: 'Professional teeth whitening treatment',
          duration: 45,
          cost: 500,
          category: 'Cosmetic',
        },
        {
          id: '5',
          name: 'Dental Crown',
          description: 'Porcelain crown placement',
          duration: 120,
          cost: 1500,
          category: 'Restorative',
        },
        {
          id: '6',
          name: 'Braces Installation',
          description: 'Orthodontic braces installation and adjustment',
          duration: 90,
          cost: 5000,
          category: 'Orthodontic',
        },
      ];

      setTreatments(mockTreatments);
    } catch (error: any) {
      toast.error('Failed to fetch treatments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Preventive: 'bg-green-100 text-green-800',
      Restorative: 'bg-blue-100 text-blue-800',
      Cosmetic: 'bg-purple-100 text-purple-800',
      Endodontic: 'bg-orange-100 text-orange-800',
      Orthodontic: 'bg-pink-100 text-pink-800',
      Surgical: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Treatments & Services</h1>
          <p className="text-muted-foreground">Manage available dental treatments and procedures</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Treatment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading treatments...</p>
            </CardContent>
          </Card>
        ) : treatments.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No treatments found</p>
            </CardContent>
          </Card>
        ) : (
          treatments.map((treatment) => (
            <Card key={treatment.id} className="shadow-card hover:shadow-lg transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{treatment.name}</CardTitle>
                  <Badge className={getCategoryColor(treatment.category)}>
                    {treatment.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{treatment.description}</p>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{treatment.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${treatment.cost}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Treatment Categories</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2 bg-green-100 text-green-800">Preventive</Badge>
            <p className="text-sm text-muted-foreground">
              Regular checkups, cleanings, and preventive care
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2 bg-blue-100 text-blue-800">Restorative</Badge>
            <p className="text-sm text-muted-foreground">
              Fillings, crowns, bridges, and tooth restoration
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2 bg-purple-100 text-purple-800">Cosmetic</Badge>
            <p className="text-sm text-muted-foreground">
              Whitening, veneers, and aesthetic improvements
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2 bg-orange-100 text-orange-800">Endodontic</Badge>
            <p className="text-sm text-muted-foreground">
              Root canals and pulp-related treatments
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2 bg-pink-100 text-pink-800">Orthodontic</Badge>
            <p className="text-sm text-muted-foreground">
              Braces, aligners, and teeth alignment
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2 bg-red-100 text-red-800">Surgical</Badge>
            <p className="text-sm text-muted-foreground">
              Extractions, implants, and surgical procedures
            </p>
          </div>
        </CardContent>
      </Card>

      <AddTreatmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchTreatments}
      />
    </div>
  );
}
