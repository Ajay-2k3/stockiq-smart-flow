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
    <Sidebar
      className={`fixed top-0 left-0 z-30 ${collapsed ? 'w-16' : 'w-64'} h-screen bg-white/95 dark:bg-zinc-900/90 backdrop-blur-lg border-r border-zinc-200 dark:border-zinc-800 rounded-none transition-all duration-300 shadow-xl flex flex-col`}
      style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
      collapsible="icon"
    >
      <SidebarContent className="py-4 flex flex-col h-full">
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
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 font-medium text-base ${
                          isActive
                            ? 'bg-primary/90 text-white shadow-lg scale-[1.04] border border-primary/30'
                            : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-100 hover:bg-accent/60 hover:text-accent-foreground hover:shadow-lg hover:scale-[1.03] border border-zinc-200 dark:border-zinc-700'
                        } backdrop-blur-sm`}
                      style={{ boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.10)' }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 6 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                      >
                        <item.icon className="w-5 h-5 drop-shadow-sm" />
                      </motion.div>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="font-medium text-base"
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
            <div className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 shadow flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize tracking-wide">
                  {user?.role} Access
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
