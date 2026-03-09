import { useEffect, useState } from 'react';
import { devError } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { PatientList } from '@/components/patients/PatientList';
import { AddPatientDialog } from '@/components/patients/AddPatientDialog';
import { toast } from 'sonner';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch patients');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.first_name.toLowerCase().includes(query) ||
        patient.last_name.toLowerCase().includes(query) ||
        patient.patient_id.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phone.includes(query)
    );
    setFilteredPatients(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, ID, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <PatientList
        patients={filteredPatients}
        loading={loading}
        onRefresh={fetchPatients}
      />

      <AddPatientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchPatients}
      />
    </div>
  );
}
