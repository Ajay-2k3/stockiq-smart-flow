import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  SWC can’t parse <motion.form>. Create a normal component alias     */
/* ------------------------------------------------------------------ */
const MotionForm = motion.form;

interface InventoryFormProps {
  item?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function InventoryForm({ item, onSave, onCancel }: InventoryFormProps) {
  /* -------------------- state -------------------- */
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    quantity: 0,
    reorderLevel: 10,
    unitPrice: 0, // UI label; mapped to price
    supplier: '',
    location: '',
  });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { get, post, put } = useApi();

  /* -------------------- fetch suppliers + preload item -------------------- */
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await get('/suppliers');
        setSuppliers(
          Array.isArray(res?.suppliers) ? res.suppliers : res?.data ?? []
        );
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to fetch suppliers',
          variant: 'destructive',
        });
      }
    };

    fetchSuppliers();

    if (item) {
      setFormData({
        name: item.name ?? '',
        sku: item.sku ?? '',
        description: item.description ?? '',
        category: item.category ?? '',
        quantity: Number(item.quantity) ?? 0,
        reorderLevel: Number(item.reorderLevel) ?? 10,
        unitPrice: Number(item.price ?? item.unitPrice) ?? 0,
        supplier: item.supplier?._id ?? '',
        location: item.location ?? '',
      });
    }
  }, [item]);

  /* -------------------- helpers -------------------- */
  const numeric = ['quantity', 'reorderLevel', 'unitPrice'];
  const handleChange = (field: string, value: any) =>
    setFormData((p) => ({
      ...p,
      [field]: numeric.includes(field) ? Number(value) : value,
    }));

  /* -------------------- submit -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    /* strip empty strings & map unitPrice → price */
    const payload: any = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v === '' || v === null) return;
      if (k === 'unitPrice') payload.price = v;
      else payload[k] = v;
    });

    try {
      if (item) {
        await put(`/inventory/${item._id}`, payload);
        toast({ title: 'Success', description: 'Item updated successfully' });
      } else {
        await post('/inventory', payload);
        toast({ title: 'Success', description: 'Item created successfully' });
      }
      onSave(payload);
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors
          ?.map((e: any) => e.msg)
          .join(', ') ||
        err?.response?.data?.message ||
        'Failed to save inventory item';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- constants -------------------- */
  const categories = [
    'Electronics',
    'Furniture',
    'Office Supplies',
    'Tools',
    'Raw Materials',
    'Finished Goods',
    'Spare Parts',
  ];

  /* -------------------- UI -------------------- */
  return (
    <MotionForm
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-describedby={undefined} /* removes Dialog warning */
    >
      {/* grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) =>
              handleChange('sku', e.target.value.toUpperCase())
            }
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => handleChange('category', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier *</Label>
          <Select
            value={formData.supplier}
            onValueChange={(v) => handleChange('supplier', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.length ? (
                suppliers.map((s: any) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="no-suppliers">
                  No suppliers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            required
          />
        </div>

        {/* Re‑order Level */}
        <div className="space-y-2">
          <Label htmlFor="reorderLevel">Reorder Level *</Label>
          <Input
            id="reorderLevel"
            type="number"
            min="0"
            value={formData.reorderLevel}
            onChange={(e) => handleChange('reorderLevel', e.target.value)}
            required
          />
        </div>

        {/* Unit Price */}
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price *</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => handleChange('unitPrice', e.target.value)}
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Warehouse section, shelf, etc."
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </MotionForm>
  );
}
