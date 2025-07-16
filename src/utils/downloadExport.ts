// utils/downloadExport.ts
import axios from 'axios';

/**
 * Download the analytics export in the requested format.
 * Works with the backend route GET /api/analytics/export?format=pdf|xlsx|csv
 */
export const downloadExport = async (
  format: 'pdf' | 'xlsx' | 'csv'
): Promise<void> => {

  // Try GET first, fallback to POST if needed
  const token = localStorage.getItem('stockiq_token') || localStorage.getItem('token') || '';
  let response;
  try {
    response = await axios.get(
      `/api/analytics/export?format=${format}`,
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    // fallback to POST if GET fails (e.g. for large payloads or CORS)
    response = await axios.post(
      '/api/analytics/export',
      { format },
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
  const { data, headers } = response;

  // Use filename coming from Content‑Disposition or fall back
  const filename =
    headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') ?? `analytics-export.${format}`;

  const blob = new Blob([data], { type: headers['content-type'] });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

