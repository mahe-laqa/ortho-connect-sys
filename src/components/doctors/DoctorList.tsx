import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Edit, Trash2, GraduationCap, Briefcase, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DoctorListProps {
  doctors: any[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (doctor: any) => void;
  onDelete: (doctorId: string) => void;
}

export function DoctorList({ doctors, loading, onRefresh, onEdit, onDelete }: DoctorListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg text-muted-foreground mb-4">No doctors found</p>
          <Button onClick={onRefresh} variant="outline">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => (
        <Card key={doctor.id} className="shadow-card hover:shadow-lg transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                </h3>
                {doctor.license_number && (
                  <Badge variant="secondary" className="mt-1">
                    {doctor.license_number}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8"
                  onClick={() => onEdit(doctor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete(doctor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {doctor.profiles?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{doctor.profiles.phone}</span>
                </div>
              )}
              
              {doctor.specialization && doctor.specialization.length > 0 && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {doctor.specialization.map((spec: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {doctor.experience_years && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{doctor.experience_years} years experience</span>
                </div>
              )}

              {doctor.consultation_fee && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${doctor.consultation_fee}</span>
                </div>
              )}
            </div>

            {doctor.education && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Education:</p>
                <p className="text-sm">{doctor.education}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
