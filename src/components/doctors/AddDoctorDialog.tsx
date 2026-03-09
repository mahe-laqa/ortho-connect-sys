import { useState, useEffect } from 'react';
import { devError } from '@/lib/logger';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';

const doctorSchema = z.object({
  userId: z.string().min(1, 'User selection is required'),
  licenseNumber: z.string().optional(),
  experienceYears: z.string().optional(),
  consultationFee: z.string().optional(),
  education: z.string().optional(),
});

interface AddDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddDoctorDialog({ open, onOpenChange, onSuccess }: AddDoctorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState('');

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
    }
  }, [open]);

  const fetchAvailableUsers = async () => {
    try {
      // Get all users with doctor or admin role who don't have a doctor profile yet
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Get existing doctor user IDs
      const { data: existingDoctors, error: doctorsError } = await supabase
        .from('doctors')
        .select('user_id');

      if (doctorsError) throw doctorsError;

      const existingDoctorIds = existingDoctors.map(d => d.user_id);
      const availableUsers = profiles.filter(p => !existingDoctorIds.includes(p.id));

      setUsers(availableUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

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
      userId: formData.get('userId') as string,
      licenseNumber: formData.get('licenseNumber') as string,
      experienceYears: formData.get('experienceYears') as string,
      consultationFee: formData.get('consultationFee') as string,
      education: formData.get('education') as string,
    };

    const validation = doctorSchema.safeParse(data);
    if (!validation.success) {
      validation.error.errors.forEach((error) => {
        toast.error(error.message);
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('doctors').insert({
        user_id: data.userId,
        license_number: data.licenseNumber || null,
        specialization: specializations.length > 0 ? specializations : null,
        education: data.education || null,
        experience_years: data.experienceYears ? parseInt(data.experienceYears) : null,
        consultation_fee: data.consultationFee ? parseFloat(data.consultationFee) : null,
      });

      if (error) throw error;

      toast.success('Doctor added successfully!');
      onOpenChange(false);
      onSuccess();
      (e.target as HTMLFormElement).reset();
      setSpecializations([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add doctor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
          <DialogDescription>
            Fill in the doctor information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Select User *</Label>
            <Select name="userId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" name="licenseNumber" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input id="experienceYears" name="experienceYears" type="number" min="0" />
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
            <Textarea id="education" name="education" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
            <Input 
              id="consultationFee" 
              name="consultationFee" 
              type="number" 
              step="0.01" 
              min="0" 
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
                  Adding...
                </>
              ) : (
                'Add Doctor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
