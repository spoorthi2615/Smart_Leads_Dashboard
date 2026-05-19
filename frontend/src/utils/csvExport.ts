import type { Lead } from '../types';

function sanitizeValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).replace(/"/g, '""');
}

export function exportLeadsToCsv(leads: Lead[], fileName = 'leads.csv'): void {
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created By', 'Created At'];
  const rows = leads.map((lead) => [
    sanitizeValue(lead.name),
    sanitizeValue(lead.email),
    sanitizeValue(lead.status),
    sanitizeValue(lead.source),
    sanitizeValue(lead.createdBy.name),
    sanitizeValue(new Date(lead.createdAt).toLocaleString()),
  ]);

  const csvPayload = [headers, ...rows]
    .map((row) => row.map((value) => `"${value}"`).join(','))
    .join('\n');

  const blob = new Blob([csvPayload], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
