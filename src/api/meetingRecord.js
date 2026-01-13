import axios from '@/lib/axios';

export const getMeetingRecords = (projectId, page = 0, size = 10) => {
    return axios.get(`/api/projects/${projectId}/docs/meeting_record`, {
        params: { page, size },
    });
};

export const getMeetingRecordDetail = (projectId, docId) => {
    return axios.get(`/api/projects/${projectId}/docs/meeting_record/${docId}`);
};

export const updateMeetingRecord = (projectId, data) => {
    return axios.patch(`/api/projects/${projectId}/docs/meeting_record/save`, data);
};

// 회의록 생성 API
export const createMeetingRecord = (projectId, data) => {
    return axios.post(`/api/projects/${projectId}/docs/meeting_record/create`, data);
};

// 내 회의록 목록 조회
export const getMyMeetingRecords = (page = 0, size = 10) => {
    return axios.get('/api/mydocs/meeting_record', {
        params: { page, size }
    });
};

export const getMyMeetingRecordDetail = (meetingRecordId) => {
    return axios.get(`/api/mydocs/meeting_record/${meetingRecordId}`);
};

export const searchMyMeetingRecords = (params) => {
    return axios.get('/api/mydocs/meeting_record/search', { params });
};
