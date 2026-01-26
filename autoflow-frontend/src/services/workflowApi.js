import api from './api';

export const workflowApi = {
    // Generate a workflow from a text description
    generate: async (description) => {
        const response = await api.post('/generate-workflow', { userPrompt: description });
        return response.data;
    },

    // Explain a workflow JSON
    explain: async (workflow) => {
        const response = await api.post('/explain-workflow', { workflow });
        return response.data;
    },

    // Simulate a message to test the engine
    simulate: async (message) => {
        const response = await api.post('/simulate-message', { message });
        return response.data;
    },
};
