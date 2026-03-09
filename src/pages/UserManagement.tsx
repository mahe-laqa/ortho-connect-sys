import { useEffect, useState } from 'react';
import { devError } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, UserCog, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type UserWithRole = {
  id: string;
  email: string;
  created_at: string;
  role: string;
  first_name?: string;
  last_name?: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { userRole, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only admins can access this page
    if (userRole && userRole !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get auth users (admin only can do this via RLS)
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        // Fallback: use profiles if admin.listUsers fails
        const combinedUsers = profiles.map((profile) => {
          const userRole = roles.find((r) => r.user_id === profile.id);
          return {
            id: profile.id,
            email: 'N/A',
            created_at: new Date().toISOString(),
            role: userRole?.role || 'patient',
            first_name: profile.first_name,
            last_name: profile.last_name,
          };
        });
        setUsers(combinedUsers);
      } else {
        // Combine all data
        const combinedUsers = authUsers.map((authUser) => {
          const profile = profiles.find((p) => p.id === authUser.id);
          const userRole = roles.find((r) => r.user_id === authUser.id);
          
          return {
            id: authUser.id,
            email: authUser.email || 'N/A',
            created_at: authUser.created_at,
            role: userRole?.role || 'patient',
            first_name: profile?.first_name,
            last_name: profile?.last_name,
          };
        });
        
        setUsers(combinedUsers);
      }
    } catch (error: any) {
      devError('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'doctor' | 'receptionist' | 'patient') => {
    if (userId === user?.id && newRole !== 'admin') {
      toast.error("You cannot remove your own admin privileges");
      return;
    }

    try {
      setUpdating(userId);
      
      // Delete all existing roles for this user first, then insert the new one
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error: any) {
      devError('Error updating role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500 hover:bg-red-600';
      case 'doctor':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'receptionist':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            View and manage user roles. First registered user is automatically assigned admin role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : 'No Name'}
                              </p>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(value) => updateUserRole(user.id, value as 'admin' | 'doctor' | 'receptionist' | 'patient')}
                              disabled={updating === user.id}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="receptionist">Receptionist</SelectItem>
                                <SelectItem value="patient">Patient</SelectItem>
                              </SelectContent>
                            </Select>
                            {updating === user.id && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Understanding different user roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge className="bg-red-500">Admin</Badge>
              <p className="text-sm text-muted-foreground">
                Full system access - can manage users, patients, appointments, doctors, and all settings
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-blue-500">Doctor</Badge>
              <p className="text-sm text-muted-foreground">
                Can view and manage patients, appointments, and treatment records
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-green-500">Receptionist</Badge>
              <p className="text-sm text-muted-foreground">
                Can manage patients, appointments, and basic administrative tasks
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-gray-500">Patient</Badge>
              <p className="text-sm text-muted-foreground">
                Limited access - default role for new signups (for future patient portal)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
