import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="inventory" element={<div>Admin Inventory</div>} />
                      <Route path="suppliers" element={<div>Admin Suppliers</div>} />
                      <Route path="users" element={<div>User Management</div>} />
                      <Route path="analytics" element={<div>Admin Analytics</div>} />
                      <Route path="alerts" element={<div>Admin Alerts</div>} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Manager Routes */}
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AppLayout>
                    <Routes>
                      <Route index element={<ManagerDashboard />} />
                      <Route path="inventory" element={<div>Manager Inventory</div>} />
                      <Route path="suppliers" element={<div>Manager Suppliers</div>} />
                      <Route path="analytics" element={<div>Manager Analytics</div>} />
                      <Route path="alerts" element={<div>Manager Alerts</div>} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Staff Routes */}
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <AppLayout>
                    <Routes>
                      <Route index element={<StaffDashboard />} />
                      <Route path="inventory" element={<div>Staff Inventory</div>} />
                      <Route path="alerts" element={<div>Staff Alerts</div>} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
