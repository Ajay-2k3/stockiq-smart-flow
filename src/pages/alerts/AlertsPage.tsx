import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { AlertCard } from '@/components/ui/alert-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertsPage() {
  const { get, put } = useApi();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await get('/alerts');
      setAlerts(data);
    } catch (error) {
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await put('/alerts/mark-all-read');
      setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
      toast.success('All alerts marked as read');
    } catch (error) {
      toast.error('Failed to mark alerts as read');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <Button onClick={markAllAsRead} variant="outline">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <AlertCard key={alert._id} alert={alert} />
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No alerts found.</p>
        </div>
      )}
    </div>
  );
}