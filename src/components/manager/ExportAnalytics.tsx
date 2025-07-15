import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText, Image } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

export const ExportAnalytics: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const api = useApi();
  const { toast } = useToast();

  const exportFormats = [
    { value: 'xlsx', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'png', label: 'Chart Images', icon: Image },
  ];

  const handleExportAnalytics = async () => {
    if (!exportFormat) {
      toast({
        title: 'Error',
        description: 'Please select an export format',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.post('/analytics/export', {
        format: exportFormat,
      });

      // Create download link
      const mimeTypes = {
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pdf: 'application/pdf',
        png: 'application/zip',
      };

      const blob = new Blob([response.data], { type: mimeTypes[exportFormat as keyof typeof mimeTypes] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${exportFormat === 'png' ? 'zip' : exportFormat}`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Analytics exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export analytics',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="bg-white shadow-md rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Export Format</label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              {exportFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center gap-2">
                    <format.icon className="h-4 w-4" />
                    {format.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export includes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Inventory trends and statistics</li>
            <li>• Supplier performance metrics</li>
            <li>• Category distribution analysis</li>
            <li>• Weekly performance data</li>
          </ul>
        </div>

        <Button
          onClick={handleExportAnalytics}
          disabled={isExporting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isExporting ? (
            'Exporting...'
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Analytics
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};