import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Package,
  Search,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { InventoryForm } from '@/components/forms/InventoryForm';

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------ */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'in-stock':
    case 'In Stock':
      return 'bg-success/10 text-success';
    case 'low-stock':
    case 'Low Stock':
      return 'bg-warning/10 text-warning';
    case 'out-of-stock':
    case 'Out of Stock':
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

/* ------------------------------------------------------------
   Dashboard component
------------------------------------------------------------ */
export default function StaffDashboard() {
  const api = useApi();

  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    itemsUpdatedToday: 0,
    lowStockAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* ---------------- fetch + derive stats ---------------- */
/* ---------------- fetch + derive stats ---------------- */
const fetchData = async () => {
  try {
    /* 1) Get as many recent records as possible */
    const res = await api.get(
      `/inventory?limit=100&sort=updatedAt&_=${Date.now()}`
    );

    /* 2) Unwrap any possible response shape */
    const allItems: any[] =
      // case  ↓ axios wrapper removed in useApi? ------------------
      Array.isArray(res) && res.length
        ? res
        // case  ↓ axios data already stripped ----------------------
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        // case  ↓ { inventory: [...] } ----------------------------
        : Array.isArray((res as any)?.data?.inventory)
        ? (res as any).data.inventory
        : Array.isArray((res as any)?.inventory)
        ? (res as any).inventory
        : [];

    console.log('✅ allItems len =', allItems.length, allItems.slice(0, 3));

    /* 3) Derive stats safely */
    const todayStr = new Date().toDateString();
    const itemsUpdatedToday = allItems.filter((it) => {
      const updated =
        it.lastUpdated ?? it.updatedAt ?? it.createdAt ?? it.timestamp;
      return updated && new Date(updated).toDateString() === todayStr;
    }).length;

    const lowStockAlerts = allItems.filter(
      (it) =>
        (it.stockStatus ?? '').includes('low') ||
        (it.stockStatus ?? '').includes('out') ||
        it.quantity <= (it.reorderLevel ?? 0)
    ).length;

    /* 4) Commit to state */
    setRecentItems(allItems.slice(0, 4));
    setStats({ itemsUpdatedToday, lowStockAlerts });
  } catch (err) {
    console.error('❌ dashboard fetch error:', err);
    toast.error('Failed to load dashboard data');
    setRecentItems([]);
    setStats({ itemsUpdatedToday: 0, lowStockAlerts: 0 });
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Quick access to inventory insights
          </p>
        </div>

        {/* Add‑item dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>

            <InventoryForm
              onSave={() => {
                fetchData();
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: 'Items Updated Today',
            value: stats.itemsUpdatedToday,
            icon: Package,
            color: 'text-primary',
          },
          {
            title: 'Low Stock Alerts',
            value: stats.lowStockAlerts,
            icon: AlertTriangle,
            color: 'text-danger',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="shadow-md border">
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

      {/* Quick search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle>Quick Inventory Search</CardTitle>
            <CardDescription>
              Search for items by name, SKU, or category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search inventory..." className="pl-10" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent items */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
            <CardDescription>
              Recently viewed or updated inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentItems.length ? (
                recentItems.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.sku}</span>
                          <span>•</span>
                          <span>Stock: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(item.stockStatus ?? item.status)}
                    >
                      {item.stockStatus ?? item.status}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent items found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
