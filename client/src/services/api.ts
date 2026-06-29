// ─── API Client ─────────────────────────────────────────────────────────────
import { API_BASE } from '@/lib/constants';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed');
  return data.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** Upload file with XHR progress tracking. */
  uploadFile(path: string, file: File, onProgress?: (pct: number) => void): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}${path}`);
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener('load', () => {
        try { const d = JSON.parse(xhr.responseText); d.success ? resolve(d.data) : reject(new Error(d.error?.message)); }
        catch { reject(new Error('Invalid response')); }
      });
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      const fd = new FormData(); fd.append('file', file); xhr.send(fd);
    });
  },
};
