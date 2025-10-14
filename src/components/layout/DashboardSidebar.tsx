import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCircle,
  Activity,
  FileText,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { userRole } = useAuth();
  const isCollapsed = state === 'collapsed';

  const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Patients', url: '/dashboard/patients', icon: Users },
    { title: 'Appointments', url: '/dashboard/appointments', icon: Calendar },
    ...(userRole === 'admin' ? [{ title: 'User Management', url: '/dashboard/users', icon: Shield }] : []),
    { title: 'Doctors', url: '/dashboard/doctors', icon: UserCircle },
    { title: 'Treatments', url: '/dashboard/treatments', icon: Activity },
    { title: 'Reports', url: '/dashboard/reports', icon: FileText },
  ];

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${isCollapsed ? 'hidden' : 'block'}`}>
            Smile Dental
          </h2>
          {isCollapsed && (
            <span className="text-2xl">🦷</span>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'hidden' : 'block'}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-smooth ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent/10'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
