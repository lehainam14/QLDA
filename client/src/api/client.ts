const API_BASE = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('jobstudent_token');

  const headers: HeadersInit = {
    ...(options.headers || {})
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type' as keyof HeadersInit]) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Lỗi HTTP ${response.status}`;
    const err = new Error(errorMsg);
    (err as any).status = response.status;
    (err as any).data = data;
    throw err;
  }

  return data as T;
}
