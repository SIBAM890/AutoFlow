import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // FastAPI Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workflowAPI = {
  generate: (nl_input) => api.post('/workflow/generate', { nl_input }),
  explain: (workflow_json) => api.post('/workflow/explain', workflow_json),
  save: (id, workflow) => api.post('/workflow/save', { id, ...workflow }),
  list: () => api.get('/workflow/list'),
  get: (id) => api.get(`/workflow/${id}`),
  update: (id, workflow) => api.put(`/workflow/${id}`, workflow),
  delete: (id) => api.delete(`/workflow/${id}`),
  activate: (id) => api.post(`/workflow/${id}/activate`),
  deactivate: (id) => api.post(`/workflow/${id}/deactivate`),
  execute: (id, trigger_data) => api.post(`/workflow/${id}/execute`, { trigger_data }),
};

export const templatesAPI = {
  list: () => api.get('/templates'),
  get: (id) => api.get(`/templates/${id}`),
  fork: (id) => api.post(`/templates/${id}/fork`),
};

export const auditAPI = {
  list: () => api.get('/audit'),
  getByWorkflow: (workflow_id) => api.get(`/audit/${workflow_id}`),
};

export const inventoryAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/inventory/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/inventory/list'),
  getData: (id) => api.get(`/inventory/${id}/data`),
};

export const whatsappAPI = {
  status: () => api.get('/whatsapp/status'),
  qr: () => api.get('/whatsapp/qr'),
  send: (to, message) => api.post('/whatsapp/send', { to, message }),
};
