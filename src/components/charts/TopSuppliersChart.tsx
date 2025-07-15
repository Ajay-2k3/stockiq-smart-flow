import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

interface SupplierData {
  name: string;
  totalItems: number;
  totalValue: number;
}

interface TopSuppliersChartProps {
  data: SupplierData[];
}

export const TopSuppliersChart: React.FC<TopSuppliersChartProps> = ({ data }) => {
  return (
    <Card className="bg-white shadow-md rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Top Suppliers by Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              type="number"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="category"
              dataKey="name"
              width={100}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value, name) => [
                name === 'totalItems' ? `${value} items` : `$${value}`,
                name === 'totalItems' ? 'Total Items' : 'Total Value'
              ]}
            />
            <Bar 
              dataKey="totalItems" 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};