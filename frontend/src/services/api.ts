import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

export async function downloadCsv(path: string, fileName: string, config?: AxiosRequestConfig): Promise<void> {
  const response = await api.get<Blob>(path, {
    ...config,
    responseType: 'blob',
  });

  const blobUrl = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
