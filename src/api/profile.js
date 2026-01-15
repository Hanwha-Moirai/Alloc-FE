import axios from '@/lib/axios';

export const fetchMyProfileSummary = () => {
    return axios.get('/api/users/me/summary');
};