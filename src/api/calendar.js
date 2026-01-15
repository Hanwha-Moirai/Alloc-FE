import axios from '@/lib/axios';

export const getCalendarData = async (projectId, from, to, view) => {
    const response = await axios.get(`/api/projects/${projectId}/calendar`, {
        params: {
            from,
            to,
            view
        }
    });

    // 백엔드 ApiResponse 객체를 반환 (실제 데이터는 response.data에 들어있음)
    return response.data;
};