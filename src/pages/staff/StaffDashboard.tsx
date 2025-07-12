import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';

const recentItems = [
  {
    id: 'SKU001',
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    stock: 25,
    status: 'In Stock',
    lastUpdate: '2 hours ago',
  },
  {
    id: 'SKU002',
    name: 'MacBook Air M3',
    category: 'Electronics', 
    stock: 8,
    status: 'Low Stock',
    lastUpdate: '4 hours ago',
  },
  {
    id: 'SKU003',
    name: 'iPad Pro 12.9"',
    category: 'Electronics',
    stock: 0,
    status: 'Out of Stock',
    lastUpdate: '1 day ago',
  },
  {
    id: 'SKU004',
    name: 'AirPods Pro',
    category: 'Accessories',
    stock: 45,
    status: 'In Stock',
    lastUpdate: '6 hours ago',
  },
];

const todayTasks = [
  {
    id: 1,
    task: 'Update iPhone 15 Pro inventory',
    priority: 'High',
    status: 'Pending',
    dueTime: '2:00 PM',
  },
  {
    id: 2,
    task: 'Check MacBook Air shipment',
    priority: 'Medium',
    status: 'In Progress',
    dueTime: '3:30 PM',
  },
  {
    id: 3,
    task: 'Process return for iPad Pro',
    priority: 'Low',
    status: 'Completed',
    dueTime: '1:00 PM',
  },
  {
    id: 4,
    task: 'Verify accessories count',
    priority: 'Medium',
    status: 'Pending',
    dueTime: '4:00 PM',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Stock':
      return 'bg-success/10 text-success';
    case 'Low Stock':
      return 'bg-warning/10 text-warning';
    case 'Out of Stock':
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-danger/10 text-danger';
    case 'Medium':
      return 'bg-warning/10 text-warning';
    case 'Low':
      return 'bg-success/10 text-success';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getTaskStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 'In Progress':
      return <Clock className="w-4 h-4 text-warning" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
  }
};

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Quick access to inventory tasks and updates
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Items Updated Today',
            value: '28',
            icon: Package,
            color: 'text-primary',
          },
          {
            title: 'Pending Tasks',
            value: '6',
            icon: Clock,
            color: 'text-warning',
          },
          {
            title: 'Low Stock Alerts',
            value: '12',
            icon: AlertTriangle,
            color: 'text-danger',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Inventory Search</CardTitle>
            <CardDescription>
              Search for items by name, SKU, or category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search inventory..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Items</CardTitle>
              <CardDescription>
                Recently viewed and updated inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {item.id}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            Stock: {item.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={getStatusColor(item.status)}
                      >
                        {item.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.lastUpdate}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>
                Your assigned tasks and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-start gap-3">
                      {getTaskStatusIcon(task.status)}
                      <div>
                        <p className="font-medium text-sm">{task.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Due: {task.dueTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={task.status === 'Completed' ? 'default' : 'outline'}
                      className={
                        task.status === 'Completed'
                          ? 'bg-success/10 text-success'
                          : task.status === 'In Progress'
                          ? 'bg-warning/10 text-warning'
                          : ''
                      }
                    >
                      {task.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}