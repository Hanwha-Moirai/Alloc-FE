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

// 회의록 삭제 API
export const deleteMeetingRecord = (projectId, meetingId) => {
    return axios.delete(`/api/projects/${projectId}/docs/meeting_record/delete`, {
        params: { meetingId }
    });
};


// ---------------------------------------------------------------------------
// 내 회의록 목록 조회
export const getMyMeetingRecords = (page = 0, size = 10) => {
    return axios.get('/api/mydocs/meeting_record', {
        params: { page, size }
    });
};

// 내 회의록 검색
export const searchMyMeetingRecords = (params) => {
    return axios.get('/api/mydocs/meeting_record/search', {
        params: {
            page: params.page || 0,
            size: params.size || 10,
            projectName: params.keyword || null, // keyword 대신 projectName 사용
            from: params.from || null,
            to: params.to || null
        }
    });
};
