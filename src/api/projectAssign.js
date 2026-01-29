import axios from '@/lib/axios';

// 프로젝트 인원 목록 조회
export const fetchProjectMembers = (projectId) => {
    return axios.get(`/api/projects/${projectId}/members`);
};

// 인력 배치 시작 - 후보 리스트 조회
export const fetchProjectAssignCandidates = (projectId) => {
    return axios.get(`/api/projects/${projectId}/assign`);
};

// 인력 배치 확정
export const submitAssignment = (projectId, payload) => {
    return axios.post(`/api/projects/${projectId}/assign`, payload);
};
