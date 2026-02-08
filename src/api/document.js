import axios from '@/lib/axios';

export const uploadAdminDocument = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/upload/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
