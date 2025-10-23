// Helper function for authenticated API calls
export function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export function getAuthHeadersFormData() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}