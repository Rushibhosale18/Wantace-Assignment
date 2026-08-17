const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const fetchConfig = async () => {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
};

export const submitEstimate = async (data) => {
  const res = await fetch(`${API_BASE}/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit estimate');
  return res.json();
};

export const loginAdmin = async (username, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const token = btoa(`${username}:${password}`); // Basic auth token
  localStorage.setItem('adminToken', token);
  return res.json();
};

export const fetchAdminLeads = async () => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${API_BASE}/admin/leads`, {
    headers: { 'Authorization': `Basic ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
};

export const fetchAdminConfig = async () => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${API_BASE}/admin/config`, {
    headers: { 'Authorization': `Basic ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
};

export const updateAdminConfig = async (config) => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${API_BASE}/admin/config`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`
    },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update config');
  return res.json();
};
