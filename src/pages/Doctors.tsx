import { useEffect, useState } from 'react';
import { devError } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { DoctorList } from '@/components/doctors/DoctorList';
import { AddDoctorDialog } from '@/components/doctors/AddDoctorDialog';
import { EditDoctorDialog } from '@/components/doctors/EditDoctorDialog';
import { toast } from 'sonner';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
      setFilteredDoctors(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch doctors');
      devError('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = doctors.filter(
      (doctor) =>
        doctor.profiles?.first_name?.toLowerCase().includes(query) ||
        doctor.profiles?.last_name?.toLowerCase().includes(query) ||
        doctor.license_number?.toLowerCase().includes(query) ||
        doctor.specialization?.some((spec: string) => spec.toLowerCase().includes(query))
    );
    setFilteredDoctors(filtered);
  };

  const handleDelete = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);

      if (error) throw error;
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error: any) {
      toast.error('Failed to delete doctor');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="text-muted-foreground">Manage doctor profiles and information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name, license, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DoctorList
        doctors={filteredDoctors}
        loading={loading}
        onRefresh={fetchDoctors}
        onEdit={setEditingDoctor}
        onDelete={handleDelete}
      />

      <AddDoctorDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchDoctors}
      />

      {editingDoctor && (
        <EditDoctorDialog
          doctor={editingDoctor}
          open={!!editingDoctor}
          onOpenChange={(open) => !open && setEditingDoctor(null)}
          onSuccess={fetchDoctors}
        />
      )}
    </div>
  );
}
