import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Separate instance for WhatsApp Bridge (Port 3001)
const whatsappApi = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const workflowApi = {
    // Generate a workflow from a text description
    generate: async (description, fileContext = null) => {
        const response = await api.post('/workflow/generate', { nl_input: description });
        return response.data;
    },

    // Upload a file for context (inventory)
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name); // Required by FastAPI Form data
        const response = await api.post('/inventory/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Explain a workflow JSON
    explain: async (workflow) => {
        const response = await api.post('/workflow/explain', workflow);
        return response.data;
    },

    simulate: async (message) => {
        const response = await api.post('/workflow/simulate', { message });
        return response.data;
    },

    // WhatsApp Bridge (Using Port 3001 and specific bridge routes)
    getStatus: async () => {
        const response = await whatsappApi.get('/status');
        return response.data;
    },

    deploy: async () => {
        const response = await whatsappApi.post('/deploy');
        return response.data;
    },

    logout: async () => {
        const response = await whatsappApi.post('/logout');
        return response.data;
    },
};
