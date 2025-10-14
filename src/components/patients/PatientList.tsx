import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientListProps {
  patients: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function PatientList({ patients, loading, onRefresh }: PatientListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg text-muted-foreground mb-4">No patients found</p>
          <Button onClick={onRefresh} variant="outline">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => (
        <Card key={patient.id} className="shadow-card hover:shadow-lg transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {patient.first_name} {patient.last_name}
                </h3>
                <Badge variant="secondary" className="mt-1">
                  {patient.patient_id}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {patient.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{patient.phone}</span>
              </div>
              {patient.date_of_birth && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {patient.allergies && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Allergies:</p>
                <p className="text-sm text-destructive">{patient.allergies}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
