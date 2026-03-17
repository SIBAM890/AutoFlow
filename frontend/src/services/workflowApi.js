import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
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
        const response = await api.post('/inventory/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Explain a workflow JSON
    explain: async (workflow) => {
        const response = await api.post('/workflow/explain', { workflow });
        return response.data;
    },

    // Simulate a message to test the engine
    simulate: async (message) => {
        const response = await api.post('/whatsapp/incoming', { from: 'simulator', message });
        return response.data;
    },
};
