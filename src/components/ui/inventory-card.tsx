import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  reorderLevel: number;
  price: number;
  supplier: {
    _id: string;
    name: string;
  };
}

interface InventoryCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

export const InventoryCard = ({ item, onEdit, onDelete }: InventoryCardProps) => {
  const { user } = useAuth();
  const isLowStock = item.quantity <= item.reorderLevel;
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant={isLowStock ? "destructive" : "default"}>
            {isLowStock ? "Low Stock" : "In Stock"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm">Qty: <strong>{item.quantity}</strong></span>
          <span className="text-sm">Reorder: {item.reorderLevel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Price: <strong>${item.price}</strong></span>
          <span className="text-sm text-muted-foreground">{item.supplier.name}</span>
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
              <Button size="sm" variant="destructive" onClick={() => onDelete(item._id)}>
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