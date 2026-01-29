import axios from '@/lib/axios';

// 인재 추천 후보 조회
export const fetchProjectAssignCandidates = (projectId, params = {}) => {
    return axios.get(`/api/projects/${projectId}/assign`, {
        params
    });
};

// 최초 인력 선발 저장 (PM)
export const submitAssignment = (projectId, payload) => {
    return axios.post(`/api/projects/${projectId}/assignments`, payload);
};


/* 프로젝트 인력 조회 */

// 최종 확정 인원 조회
export const fetchAssignedMembers = (projectId) => {
    return axios.get(`/api/projects/${projectId}/assignments/assigned`);
};

// 인력 배치 관리 화면
export const fetchAssignmentManagementPage = (projectId) => {
    return axios.get(`/api/projects/${projectId}/members`);
};

// 선발 상태 요약
export const fetchAssignmentStatus = (projectId) => {
    return axios.get(`/api/projects/${projectId}/assignments`);
};

// 추가 후보 생성 (PM)
export const addAdditionalCandidates = (projectId) => {
    return axios.post(`/api/projects/${projectId}/assignments/additional`);
};

// 요청 상태 변경 - 면담 요청
export const requestInterview = (projectId, userId) => {
    return axios.patch(
        `/api/projects/${projectId}/members/${userId}/interview`
    );
};

// 요청 상태 변경 - 수락
export const acceptAssignment = (projectId, userId) => {
    return axios.patch(
        `/api/projects/${projectId}/members/${userId}/accept`
    );
};

// 직원 응답 (USER)
export const respondAssignment = (projectId, assignmentId, status) => {
    return axios.post(
        `/api/projects/${projectId}/assignments/${assignmentId}/response`,
        null,
        { params: { status } }
    )
}

// PM 최종 결정
export const decideFinalAssignment = (projectId, assignmentId, decision) => {
    return axios.post(
        `/api/projects/${projectId}/assignments/${assignmentId}/decision`,
        null,
        { params: { decision } }
    )
}

