/* The logic you supplied is intact – only styling additions for a subtle 3‑D
   tilt / depth on hover (works purely with CSS / Tailwind & GPU). */

import React, { useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon, Download, FileText, BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const GenerateReport: React.FC = () => {
  const [reportType, setReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const api = useApi();
  const { toast } = useToast();

  const reportTypes = [
    { value: 'inventory', label: 'Inventory Report', icon: FileText },
    { value: 'suppliers', label: 'Suppliers Report', icon: BarChart3 },
    { value: 'users',     label: 'Users Report',     icon: FileText },
    { value: 'analytics', label: 'Analytics Report', icon: BarChart3 },
  ];

// ── GenerateReport.tsx ──────────────────────────────────────────────
const handleGenerateReport = async () => {
  if (!reportType) {
    toast({
      title: 'Error',
      description: 'Please select a report type',
      variant: 'destructive',
    });
    return;
  }

  setIsGenerating(true);

  try {
    /* 1️⃣  get the JWT you stored at login */
    const token = localStorage.getItem('stockiq_token') || '';

    /* 2️⃣  make the request with the token in the header */
    const res = await fetch('/api/reports/generate?format=pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,   // ← HERE
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify({
        type     : reportType,     // optional, you can keep or remove
        startDate: dateRange.from, // optional
        endDate  : dateRange.to,   // optional
      }),
    });

    if (!res.ok) {
      let errorMsg = `Failed to generate report (status: ${res.status})`;
      if (res.status === 401) {
        errorMsg = 'Unauthorized: Please log in as an admin.';
      } else if (res.status === 403) {
        errorMsg = 'Forbidden: You do not have permission to generate this report.';
      } else if (res.status === 404) {
        errorMsg = 'Report route not found (404). Please check backend connection.';
      }
      throw new Error(errorMsg);
    }

    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.download = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Success', description: 'PDF downloaded' });
  } catch (err) {
    console.error(err);
    toast({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Failed to generate report',
      variant: 'destructive',
    });
  } finally {
    setIsGenerating(false);
  }
};



  return (
    <Card
      /* ⭐ 3‑D tilt via transform‑gpu & group‑hover */
      className="group w-full bg-white shadow-lg border rounded-2xl transition-transform transform-gpu hover:rotate-x-2 hover:-rotate-y-1 hover:scale-[1.02]"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Reports
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Report type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center gap-2">
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Date range */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date Range (optional)</label>
          <div className="flex gap-2">
            {['from', 'to'].map((key) => (
              <Popover key={key}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !dateRange[key as 'from' | 'to'] && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange[key as 'from' | 'to']
                      ? format(dateRange[key as 'from' | 'to'] as Date, 'PPP')
                      : key === 'from' ? 'From date' : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange[key as 'from' | 'to']}
                    onSelect={(d) => setDateRange((p) => ({ ...p, [key]: d }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isGenerating ? (
            'Generating...'
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
