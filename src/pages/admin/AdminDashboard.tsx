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
  Users,
  Truck,
  AlertTriangle,
  DollarSign,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
/* ✅ default export = container, named = tooltip bits */
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { GenerateReport } from '@/components/admin/GenerateReport';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeLocale = 'en-US';
let fmt: Intl.NumberFormat;

try {
  fmt = new Intl.NumberFormat(safeLocale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
} catch {
  fmt = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [showReport, setShowReport] = useState(false);
  const api = useApi();

  /* ---------------- state ---------------- */
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalUsers: 0,
    totalSuppliers: 0,
    inventoryValue: 0,
    turnover: 0,
    turnoverChange: 0,
  });

  const [trend, setTrend] = useState<
    { month: string; items: number; value: number }[]
  >([]);

  const [loading, setLoading] = useState(true);

  /* ---------------- fetch ---------------- */
  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, suppliersRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/users?limit=1'),
        api.get('/suppliers?limit=1'),
      ]);

      console.log('📊 analytics payload ', analyticsRes);

      const inv  = analyticsRes.inventoryStats;
      const kpis = analyticsRes.kpis ?? {};
      const t    = inv.trends.map((p: any) => ({
        month: p.month,
        items: p.quantity,
        value: p.value ?? 0,
      }));

      setStats({
        totalItems:     inv.totalItems,
        lowStock:       inv.lowStockItems,
        totalUsers:     usersRes.pagination?.totalItems ?? 0,
        totalSuppliers: suppliersRes.pagination?.totalItems ?? 0,
        inventoryValue: inv.totalValue,
        turnover:       kpis.turnover ?? 0,
        turnoverChange: kpis.turnoverChange ?? 0,
      });

      setTrend(t);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading dashboard…
      </div>
    );
  }

  /* ---- Build the metric cards ---- */
  const metricCards = [
    {
      title: 'Total Items',
      value: stats.totalItems.toLocaleString(),
      change: `${stats.turnoverChange >= 0 ? '+' : ''}${stats.turnoverChange}%`,
      changeType: stats.turnoverChange >= 0 ? 'positive' : 'negative',
      icon: Package,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStock.toLocaleString(),
      change: '',
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '',
      changeType: 'positive',
      icon: Users,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Active Suppliers',
      value: stats.totalSuppliers.toLocaleString(),
      change: '',
      changeType: 'positive',
      icon: Truck,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  /* ---- colours for ChartContainer keys ---- */
  const chartConfig = {
    items: { label: 'Items', color: 'hsl(var(--primary))' },
    value: { label: 'Value', color: 'hsl(var(--success))' },
  };

  /* ---- UI ---- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete overview of your inventory system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowReport(true)}>
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          {showReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-4 relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowReport(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <GenerateReport />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {m.title}
                    </p>
                    <p className="text-2xl font-bold">{m.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${m.bg}`}>
                    <m.icon className={`w-6 h-6 ${m.color}`} />
                  </div>
                </div>
                {m.change && (
                  <div className="mt-4">
                    <Badge
                      variant={
                        m.changeType === 'positive' ? 'default' : 'secondary'
                      }
                      className={
                        m.changeType === 'positive'
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-danger/10 text-danger hover:bg-danger/20'
                      }
                    >
                      {m.change} from last month
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Trend – items */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Inventory Trend</CardTitle>
              <CardDescription>Monthly inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="items" fill="var(--color-items)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Value – line */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
              <CardDescription>Total inventory value progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(v) => fmt.format(v)}
                      domain={[0, 'auto']}
                    />
                    <ChartTooltip
                      content={(p) => (
                        <ChartTooltipContent {...p} fmt={fmt.format} />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
