import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Users, Truck, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const inventoryData = [
  { month: 'Jan', items: 1200, value: 45000 },
  { month: 'Feb', items: 1350, value: 52000 },
  { month: 'Mar', items: 1100, value: 41000 },
  { month: 'Apr', items: 1450, value: 58000 },
  { month: 'May', items: 1600, value: 62000 },
  { month: 'Jun', items: 1750, value: 68000 },
];

const chartConfig = {
  items: {
    label: 'Items',
    color: 'hsl(var(--primary))',
  },
  value: {
    label: 'Value ($)',
    color: 'hsl(var(--success))',
  },
};

const stats = [
  {
    title: 'Total Items',
    value: '1,750',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Package,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Low Stock Alerts',
    value: '23',
    change: '-5%',
    changeType: 'negative' as const,
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    title: 'Total Users',
    value: '47',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Users,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'Active Suppliers',
    value: '15',
    change: '+2%',
    changeType: 'positive' as const,
    icon: Truck,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
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
        <Button>
          Generate Report
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <Badge
                    variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                    className={
                      stat.changeType === 'positive'
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-danger/10 text-danger hover:bg-danger/20'
                    }
                  >
                    {stat.change} from last month
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Inventory Trend</CardTitle>
              <CardDescription>
                Monthly inventory levels over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData}>
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
              <CardDescription>
                Total inventory value progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'Low stock alert',
                  item: 'iPhone 15 Pro',
                  time: '2 minutes ago',
                  type: 'warning',
                },
                {
                  action: 'New supplier added',
                  item: 'TechCorp Solutions',
                  time: '1 hour ago',
                  type: 'success',
                },
                {
                  action: 'Inventory update',
                  item: 'Samsung Galaxy S24',
                  time: '3 hours ago',
                  type: 'info',
                },
                {
                  action: 'User created',
                  item: 'John Smith (Manager)',
                  time: '5 hours ago',
                  type: 'success',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === 'warning'
                          ? 'bg-warning'
                          : activity.type === 'success'
                          ? 'bg-success'
                          : 'bg-primary'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.item}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}