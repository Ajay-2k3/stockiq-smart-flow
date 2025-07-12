import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
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
  BarChart3,
  Package,
  Truck,
  AlertTriangle,
  Users,
  Home,
  TrendingUp,
  Settings,
} from 'lucide-react';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: Home },
  { title: 'Inventory', url: '/admin/inventory', icon: Package },
  { title: 'Suppliers', url: '/admin/suppliers', icon: Truck },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Alerts', url: '/admin/alerts', icon: AlertTriangle },
];

const managerItems = [
  { title: 'Dashboard', url: '/manager', icon: Home },
  { title: 'Inventory', url: '/manager/inventory', icon: Package },
  { title: 'Suppliers', url: '/manager/suppliers', icon: Truck },
  { title: 'Analytics', url: '/manager/analytics', icon: TrendingUp },
  { title: 'Alerts', url: '/manager/alerts', icon: AlertTriangle },
];

const staffItems = [
  { title: 'Dashboard', url: '/staff', icon: Home },
  { title: 'Inventory', url: '/staff/inventory', icon: Package },
  { title: 'Alerts', url: '/staff/alerts', icon: AlertTriangle },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminItems;
      case 'manager':
        return managerItems;
      case 'staff':
        return staffItems;
      default:
        return [];
    }
  };

  const items = getNavigationItems();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="font-medium"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role indicator */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-auto p-4"
          >
            <div className="bg-card rounded-lg p-3 border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role} Access
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}