import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/* util: tiny money formatter (USD) */
const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export const InventoryCard = ({
  item,
  onEdit,
  onDelete,
}: InventoryCardProps) => {
  const { user } = useAuth();

  const badge =
    item.stockStatus === 'out-of-stock'
      ? { text: 'Out of Stock', variant: 'destructive' }
      : item.stockStatus === 'low-stock'
      ? { text: 'Low Stock', variant: 'destructive' }
      : { text: 'In Stock', variant: 'default' };

  const canEdit   = ['admin', 'manager'].includes(user?.role ?? '');
  const canDelete = user?.role === 'admin';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}

        <div className="flex justify-between text-sm">
          <span>
            Qty: <strong>{item.quantity}</strong>
          </span>
          <span>Reorder: {item.reorderLevel}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>
            Price: <strong>{fmt.format(item.price)}</strong>
          </span>
          <span className="text-muted-foreground">{item.supplier.name}</span>
        </div>

        {(canEdit || canDelete) && (
          <div className="flex gap-2 pt-2">
            {canEdit && onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(item._id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
