import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

import { ExportAnalytics } from '@/components/manager/ExportAnalytics';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--danger))',
];

export default function ManagerDashboard() {
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    turnover: '--',
    turnoverChange: '--',
    accuracy: '--',
    accuracyChange: '--',
    activeAlerts: 0,
    alertsChange: 0,
  });
  const [showExport, setShowExport] = useState(false);

  /* ---------------- fetch ---------------- */
  const fetchAnalytics = async () => {
    try {
      const a = await api.get('/analytics');
      console.log('📊 analytics payload', a);

      // Pie chart data
      const cat = a.inventoryStats?.categoryCounts ?? {};
      const totalCat = Object.values(cat).reduce((s: any, n: any) => s + n, 0) || 1;
      setCategoryData(
        Object.entries(cat).map(([name, cnt]: any[], i) => ({
          name,
          value: +((cnt / totalCat) * 100).toFixed(1),
          color: COLORS[i % COLORS.length],
        }))
      );

      // Weekly performance data (from inventoryStats.weekTrends)
      const weekTrends = a.inventoryStats?.weekTrends ?? [];
      // Map to chart format: day, efficiency, orders
      const perfData = weekTrends.map((w: any) => ({
        day: w.date?.slice(5), // e.g. '07-16'
        efficiency: w.quantity, // or compute a real efficiency metric if available
        orders: w.value, // or use another metric if needed
      }));
      setPerformanceData(perfData);

      // Suppliers
      setSuppliers(a.supplierStats?.topSuppliers ?? []);

      // KPIs
      setMetrics({
        turnover: (a.kpis?.turnover ?? 0).toFixed(2) + 'x',
        turnoverChange: a.kpis?.turnoverChange ?? 0,
        accuracy: (a.kpis?.accuracy ?? 0).toFixed(1) + '%',
        accuracyChange: a.kpis?.accuracyChange ?? 0,
        activeAlerts: a.kpis?.activeAlerts ?? 0,
        alertsChange: a.kpis?.alertsChange ?? 0,
      });
    } catch (err) {
      console.error('❌ analytics fetch error', err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* --------------- ui --------------- */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Analytics and performance insights
          </p>
        </div>
        <Button onClick={() => setShowExport(true)}>Export Analytics</Button>
        {showExport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-4 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowExport(false)}
                aria-label="Close"
              >
                ×
              </button>
              <ExportAnalytics />
            </div>
          </div>
        )}
      </motion.div>

      {/* key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Inventory Turnover',
            value: metrics.turnover,
            change: metrics.turnoverChange,
            icon: TrendingUp,
            color: 'text-success',
          },
          {
            title: 'Stock Accuracy',
            value: metrics.accuracy,
            change: metrics.accuracyChange,
            icon: BarChart3,
            color: 'text-primary',
          },
          {
            title: 'Active Alerts',
            value: metrics.activeAlerts,
            change: metrics.alertsChange,
            icon: AlertTriangle,
            color: 'text-warning',
          },
        ].map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {m.title}
                    </p>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <Badge variant="outline" className="mt-2">
                      {m.change}
                    </Badge>
                  </div>
                  <m.icon className={`w-8 h-8 ${m.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---------- pie chart (wrapped) ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>
              Distribution of items across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No category data available
              </p>
            ) : (
              <ChartContainer
                config={{ value: { label: '%', color: COLORS[0] } }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {categoryData.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* ---------- weekly area chart ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>
              Efficiency and order trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No performance data
              </p>
            ) : (
              <ChartContainer
                config={{
                  efficiency: { label: 'Efficiency %', color: COLORS[0] },
                  orders: { label: 'Orders', color: COLORS[1] },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke={COLORS[0]}
                      fill={COLORS[0]}
                      fillOpacity={0.25}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke={COLORS[1]}
                      fill={COLORS[1]}
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* suppliers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Suppliers</CardTitle>
          <CardDescription>
            Reliability and delivery performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No supplier data yet
            </p>
          ) : (
            <div className="space-y-4">
              {suppliers.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.itemCount} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={s.score >= 95 ? 'default' : 'secondary'}
                      className={
                        s.score >= 95
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }
                    >
                      {s.score}% Score
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.onTime}% On‑time
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
