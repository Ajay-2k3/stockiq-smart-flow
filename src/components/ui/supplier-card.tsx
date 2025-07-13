import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface SupplierCardProps {
  supplier: Supplier;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (id: string) => void;
}

export const SupplierCard = ({ supplier, onEdit, onDelete }: SupplierCardProps) => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  const formattedAddress = [
    supplier.address?.street,
    supplier.address?.city,
    supplier.address?.state,
    supplier.address?.zipCode,
    supplier.address?.country
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{supplier.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          {supplier.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          {supplier.phone}
        </div>
        {formattedAddress && (
          <p className="text-sm text-muted-foreground">{formattedAddress}</p>
        )}
        {(canEdit || canDelete) && (
          <div className="flex gap-2 pt-2">
            {canEdit && onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(supplier)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {canDelete && onDelete && (
              <Button size="sm" variant="destructive" onClick={() => onDelete(supplier._id)}>
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
