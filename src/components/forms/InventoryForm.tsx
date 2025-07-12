import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useInventory, useSuppliers } from '@/hooks/useApi';

interface InventoryFormProps {
  item?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InventoryForm({ item, onSuccess, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    quantity: 0,
    reorderLevel: 10,
    unitPrice: 0,
    supplier: '',
    location: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const inventory = useInventory();
  const supplierApi = useSuppliers();

  useEffect(() => {
    // Fetch suppliers
    const fetchSuppliers = async () => {
      try {
        const response = await supplierApi.getAll();
        setSuppliers(response.data.suppliers);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch suppliers",
          variant: "destructive"
        });
      }
    };

    fetchSuppliers();

    // Populate form if editing
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        reorderLevel: item.reorderLevel || 10,
        unitPrice: item.unitPrice || 0,
        supplier: item.supplier?._id || '',
        location: item.location || ''
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await inventory.update(item._id, formData);
        toast({
          title: "Success",
          description: "Inventory item updated successfully",
        });
      } else {
        await inventory.create(formData);
        toast({
          title: "Success",
          description: "Inventory item created successfully",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save inventory item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    'Electronics',
    'Furniture',
    'Office Supplies',
    'Tools',
    'Raw Materials',
    'Finished Goods',
    'Spare Parts'
  ];

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier *</Label>
          <Select value={formData.supplier} onValueChange={(value) => handleChange('supplier', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier: any) => (
                <SelectItem key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorderLevel">Reorder Level *</Label>
          <Input
            id="reorderLevel"
            type="number"
            min="0"
            value={formData.reorderLevel}
            onChange={(e) => handleChange('reorderLevel', parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price *</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Product description..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </motion.form>
  );
}