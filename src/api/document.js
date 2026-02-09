import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

export const uploadAdminDocument = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const fetchAdminDocuments = () => {
    return api.get('/api/docs/pdf');
};
