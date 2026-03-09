import { useEffect, useState } from 'react';
import { devError } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity,
  UserCheck,
  Clock,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Reports() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    completedAppointments: 0,
    scheduledAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch total patients
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Fetch total doctors
      const { count: doctorsCount } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true });

      // Fetch total appointments
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      // Fetch completed appointments
      const { count: completedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Fetch scheduled appointments
      const { count: scheduledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['scheduled', 'confirmed']);

      // Fetch cancelled appointments
      const { count: cancelledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      setStats({
        totalPatients: patientsCount || 0,
        totalAppointments: appointmentsCount || 0,
        totalDoctors: doctorsCount || 0,
        completedAppointments: completedCount || 0,
        scheduledAppointments: scheduledCount || 0,
        cancelledAppointments: cancelledCount || 0,
        todayAppointments: todayCount || 0,
      });
    } catch (error: any) {
      toast.error('Failed to fetch statistics');
      devError('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.totalAppointments > 0
    ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)
    : 0;

  const cancellationRate = stats.totalAppointments > 0
    ? ((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Clinic performance and statistics overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in system</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appointments
            </CardTitle>
            <div className="bg-accent/10 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Doctors
            </CardTitle>
            <div className="bg-success/10 p-2 rounded-full">
              <UserCheck className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDoctors}</div>
            <p className="text-xs text-muted-foreground mt-1">Medical professionals</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Schedule
            </CardTitle>
            <div className="bg-warning/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Appointments today</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Statistics */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Appointment Statistics
          </CardTitle>
          <CardDescription>Breakdown of appointment statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <Badge className="bg-green-100 text-green-800">
                  {stats.completedAppointments}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Scheduled</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {stats.scheduledAppointments}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${stats.totalAppointments > 0 
                      ? (stats.scheduledAppointments / stats.totalAppointments * 100) 
                      : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Active bookings</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cancelled</span>
                <Badge className="bg-red-100 text-red-800">
                  {stats.cancelledAppointments}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${cancellationRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{cancellationRate}% cancellation rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Patient Growth</p>
                <p className="text-xs text-muted-foreground">Total registered patients</p>
              </div>
              <div className="text-2xl font-bold text-primary">{stats.totalPatients}</div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Appointment Completion</p>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </div>
              <div className="text-2xl font-bold text-success">{completionRate}%</div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Active Bookings</p>
                <p className="text-xs text-muted-foreground">Scheduled appointments</p>
              </div>
              <div className="text-2xl font-bold text-accent">{stats.scheduledAppointments}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Clinic Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Doctor Availability</p>
                <p className="text-xs text-muted-foreground">Active medical staff</p>
              </div>
              <div className="text-2xl font-bold">{stats.totalDoctors}</div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Today's Workload</p>
                <p className="text-xs text-muted-foreground">Scheduled for today</p>
              </div>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Avg. Patients/Doctor</p>
                <p className="text-xs text-muted-foreground">Patient distribution</p>
              </div>
              <div className="text-2xl font-bold">
                {stats.totalDoctors > 0 
                  ? Math.round(stats.totalPatients / stats.totalDoctors) 
                  : 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
