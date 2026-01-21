import axios from '@/lib/axios';

// 태스크 목록 조회 (필터 대응)
export const getGanttTasks = (projectId, params = {}) => {
    return axios.get(
        `/api/projects/${projectId}/tasks`,
        { params }
    );
};

// 태스크 생성
export const createTask = (projectId, data) => {
    return axios.post(`/api/projects/${projectId}/tasks`, data);
};

// 태스크 수정
export const updateTask = (projectId, taskId, data) => {
    return axios.patch(`/api/projects/${projectId}/tasks/${taskId}`, data);
};

// 태스크 삭제
export const deleteTask = (projectId, taskId) => {
    return axios.delete(`/api/projects/${projectId}/tasks/${taskId}`);
};

// 태스크 완료 상태 변경
export const completeTask = (projectId, taskId, data) => {
    return axios.patch(`/api/projects/${projectId}/tasks/${taskId}/complete`, data);
};


// ---------------------------- 마일스톤 --------------------------------------

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