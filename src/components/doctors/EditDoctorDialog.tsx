import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditDoctorDialogProps {
  doctor: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditDoctorDialog({ doctor, open, onOpenChange, onSuccess }: EditDoctorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState('');

  useEffect(() => {
    if (doctor && open) {
      setSpecializations(doctor.specialization || []);
    }
  }, [doctor, open]);

  const addSpecialization = () => {
    if (newSpec.trim() && !specializations.includes(newSpec.trim())) {
      setSpecializations([...specializations, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      licenseNumber: formData.get('licenseNumber') as string,
      experienceYears: formData.get('experienceYears') as string,
      consultationFee: formData.get('consultationFee') as string,
      education: formData.get('education') as string,
    };

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          license_number: data.licenseNumber || null,
          specialization: specializations.length > 0 ? specializations : null,
          education: data.education || null,
          experience_years: data.experienceYears ? parseInt(data.experienceYears) : null,
          consultation_fee: data.consultationFee ? parseFloat(data.consultationFee) : null,
        })
        .eq('id', doctor.id);

      if (error) throw error;

      toast.success('Doctor updated successfully!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update doctor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
          <DialogDescription>
            Update doctor information for Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input 
                id="licenseNumber" 
                name="licenseNumber" 
                defaultValue={doctor.license_number || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input 
                id="experienceYears" 
                name="experienceYears" 
                type="number" 
                min="0"
                defaultValue={doctor.experience_years || ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="flex gap-2">
              <Input
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                placeholder="e.g., Orthodontics"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <Button type="button" onClick={addSpecialization} variant="outline">
                Add
              </Button>
            </div>
            {specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="gap-1">
                    {spec}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSpecialization(spec)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea 
              id="education" 
              name="education" 
              rows={3}
              defaultValue={doctor.education || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
            <Input 
              id="consultationFee" 
              name="consultationFee" 
              type="number" 
              step="0.01" 
              min="0"
              defaultValue={doctor.consultation_fee || ''}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Doctor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
