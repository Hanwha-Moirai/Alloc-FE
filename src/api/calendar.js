import axios from '@/lib/axios';

// 일정 조회
export const getCalendarData = async (projectId, from, to, view) => {
    const response = await axios.get(`/api/projects/${projectId}/calendar`, {
        params: {
            from,
            to,
            view
        }
    });

    return response.data;
};

// 공유 일정 생성
export const createSharedEvent = async (projectId, data) => {
    // POST /api/projects/{projectId}/calendar/events/shared
    const response = await axios.post(
        `/api/projects/${projectId}/calendar/events/shared`,
        data
    );
    return response.data;
};

// 개인 일정 생성
export const createPersonalEvent = async (projectId, data) => {
    // POST /api/projects/{projectId}/calendar/events/personal
    const response = await axios.post(
        `/api/projects/${projectId}/calendar/events/personal`,
        data
    );
    return response.data;
};

// 휴가 일정 생성
export const createVacationEvent = async (projectId, data) => {
    // POST /api/projects/{projectId}/calendar/events/vacation
    const response = await axios.post(
        `/api/projects/${projectId}/calendar/events/vacation`,
        data
    );
    return response.data;
};

// 다가오는 일정 조회 (프로젝트 기준)
export const getUpcomingProjectEvents = (projectId, limit = 3) => {
    return axios.get(`/api/projects/${projectId}/calendar/upcoming`, {
        params: { limit }
    })
}

// 이번주 일정 카운트
export const getMyWeeklyEventCount = () => {
    return axios.get('/api/calendar/weekly-count')
}
