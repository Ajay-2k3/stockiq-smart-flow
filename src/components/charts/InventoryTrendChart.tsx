import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface InventoryTrendData {
  date: string;
  totalItems: number;
  lowStock: number;
  outOfStock: number;
}

interface InventoryTrendChartProps {
  data: InventoryTrendData[];
}

export const InventoryTrendChart: React.FC<InventoryTrendChartProps> = ({ data }) => {
  return (
    <Card className="bg-white shadow-md rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Inventory Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalItems" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Total Items"
            />
            <Line 
              type="monotone" 
              dataKey="lowStock" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              name="Low Stock"
            />
            <Line 
              type="monotone" 
              dataKey="outOfStock" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Out of Stock"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};