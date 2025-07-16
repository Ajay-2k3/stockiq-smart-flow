import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadExport } from '@/utils/downloadExport';   // 👈 NEW

export const ExportAnalytics: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  /** Available formats – change csv ➜ png if you actually return images */
  const exportFormats = [
    { value: 'pdf',  label: 'PDF Report',        icon: FileText },
    { value: 'csv',  label: 'Chart Data (CSV)',  icon: Image },
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
      await downloadExport(exportFormat as 'pdf' | 'xlsx' | 'csv');
      toast({
        title: 'Success',
        description: 'Analytics exported successfully',
      });
    } catch (err) {
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
          <Download className="h-5 w-5" /> Export Analytics
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Format Picker */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Export Format
          </label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              {exportFormats.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* What’s included */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export includes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Inventory trends and statistics</li>
            <li>• Supplier performance metrics</li>
            <li>• Category distribution analysis</li>
            <li>• Weekly performance data</li>
          </ul>
        </div>

        {/* Action button */}
        <Button
          onClick={handleExportAnalytics}
          disabled={isExporting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isExporting ? (
            'Exporting…'
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
