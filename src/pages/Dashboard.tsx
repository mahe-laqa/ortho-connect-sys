import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalDoctors: 0,
    activeAppointments: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total patients
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      // Fetch total doctors
      const { count: doctorsCount } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true });

      // Fetch active appointments (scheduled/confirmed)
      const { count: activeCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['scheduled', 'confirmed']);

      setStats({
        totalPatients: patientsCount || 0,
        todayAppointments: todayCount || 0,
        totalDoctors: doctorsCount || 0,
        activeAppointments: activeCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Active Appointments',
      value: stats.activeAppointments,
      icon: Activity,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: TrendingUp,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your clinic overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="shadow-card hover:shadow-lg transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} p-2 rounded-full`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div 
            className="p-4 border rounded-lg hover:bg-accent/5 transition-smooth cursor-pointer"
            onClick={() => navigate('/dashboard/patients')}
          >
            <h3 className="font-semibold mb-1">Add New Patient</h3>
            <p className="text-sm text-muted-foreground">Register a new patient</p>
          </div>
          <div 
            className="p-4 border rounded-lg hover:bg-accent/5 transition-smooth cursor-pointer"
            onClick={() => navigate('/dashboard/appointments')}
          >
            <h3 className="font-semibold mb-1">Schedule Appointment</h3>
            <p className="text-sm text-muted-foreground">Book a new appointment</p>
          </div>
          <div 
            className="p-4 border rounded-lg hover:bg-accent/5 transition-smooth cursor-pointer"
            onClick={() => navigate('/dashboard/appointments')}
          >
            <h3 className="font-semibold mb-1">View Calendar</h3>
            <p className="text-sm text-muted-foreground">Check today's schedule</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
