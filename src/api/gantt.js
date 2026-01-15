import axios from '@/lib/axios';

// 태스크 목록 조회
export const getGanttTasks = (projectId) => {
    return axios.get(`/api/projects/${projectId}/tasks`);
};

// 마일스톤 목록 조회
export const getGanttMilestones = (projectId) => {
    return axios.get(`/api/projects/${projectId}/ganttchart/milestones`);
};

// 마일스톤 생성 API
export const createMilestone = (projectId, data) => {
    return axios.post(`/api/projects/${projectId}/ganttchart/milestones`, data);
};

// 마일스톤 수정
export const updateMilestone = (projectId, milestoneId, data) => {
    return axios.patch(`/api/projects/${projectId}/ganttchart/milestones/${milestoneId}`, data);
};

// 마일스톤 삭제
export const deleteMilestone = (projectId, milestoneId) => {
    return axios.delete(`/api/projects/${projectId}/ganttchart/milestones/${milestoneId}`);
};