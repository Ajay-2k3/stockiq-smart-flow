import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface Alert {
  _id: string;
  type: 'low_stock' | 'system' | 'info';
  message: string;
  itemId?: string;
  isRead: boolean;
  createdAt: string;
}

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard = ({ alert }: AlertCardProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'system': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'low_stock': return 'destructive';
      case 'system': return 'destructive';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${!alert.isRead ? 'border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getAlertIcon(alert.type)}
            Alert
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={getAlertVariant(alert.type)}>
              {alert.type.replace('_', ' ').toUpperCase()}
            </Badge>
            {!alert.isRead && (
              <Badge variant="outline">New</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{alert.message}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(alert.createdAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};