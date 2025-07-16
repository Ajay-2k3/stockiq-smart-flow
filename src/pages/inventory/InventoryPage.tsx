import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { InventoryCard } from '@/components/ui/inventory-card';
import { InventoryForm } from '@/components/forms/InventoryForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  supplier: { _id: string; name: string };
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { get, post, put, del } = useApi();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  /* ------------ Fetch ------------ */
/* ------------ Fetch (only this block changed) ------------ */
const fetchInventory = async () => {
  setLoading(true);
  try {
    const res = await get(`/inventory?_=${Date.now()}`);       // cache‑buster
    const list = Array.isArray(res) ? res : res?.inventory ?? [];

    /* 🔄  Normalise each record so the UI never sees undefined fields */
    const normalised = list.map((it: any) => ({
      ...it,
      /* back‑compat: some older items still have unitPrice only */
      price: it.price ?? it.unitPrice ?? 0,
      stockStatus:
        it.stockStatus ??
        (it.quantity === 0
          ? 'out-of-stock'
          : it.quantity <= it.reorderLevel
          ? 'low-stock'
          : 'in-stock'),
    }));

    setInventory(normalised);
  } catch (err) {
    toast.error('Failed to fetch inventory');
    console.error(err);
    setInventory([]);      // graceful fallback
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchInventory();
  }, []);

  /* ------------ Save ------------ */
  const handleSave = async (formData: Record<string, any>) => {
    const payload = {
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      reorderLevel: Number(formData.reorderLevel),
    };

    try {
      if (editingItem) {
        await put(`/inventory/${editingItem._id}`, payload);
        toast.success('Item updated successfully');
      } else {
        await post('/inventory', payload);
        toast.success('Item added successfully');
      }
      fetchInventory();
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      /* --------- Friendly error handling --------- */
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || 'Failed to save item';

      if (status === 409) {
        toast.error(message); // "SKU already exists"
      } else if (status === 400) {
        toast.error('Please check the form for errors.');
      } else {
        toast.error('Failed to save item');
      }

      console.error(err);
    }
  };

  /* ------------ Delete ------------ */
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await del(`/inventory/${id}`);
      toast.success('Item deleted successfully');
      fetchInventory();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete item';
      toast.error(msg);
      console.error(err);
    }
  };

  /* ------------ Filter ------------ */
  const filteredInventory = inventory.filter((item) =>
    `${item.name}${item.description ?? ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* ------------ UI ------------ */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </DialogTitle>
              </DialogHeader>
              <InventoryForm
                item={editingItem ?? undefined}
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredInventory.map((item) => (
          <InventoryCard
            key={item._id}
            item={item}
            onEdit={(itm) => {
              setEditingItem(itm);
              setIsDialogOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No inventory items found.
        </div>
      )}
    </div>
  );
}
