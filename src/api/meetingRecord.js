import axios from '@/lib/axios';

export const getMeetingRecords = (projectId, page = 0, size = 10) => {
    return axios.get(`/api/projects/${projectId}/docs/meeting_record`, {
        params: { page, size },
    });
};

export const getMeetingRecordDetail = (projectId, docId) => {
    return axios.get(`/api/projects/${projectId}/docs/meeting_record/${docId}`);
};
