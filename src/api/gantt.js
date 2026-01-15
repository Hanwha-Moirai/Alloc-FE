import axios from '@/lib/axios';

// 태스크 목록 조회
export const getGanttTasks = (projectId) => {
    // 파라미터를 명시적으로 보내지 않아 백엔드에서 null로 처리하게 유도
    return axios.get(`/api/projects/${projectId}/tasks`);
};

// 마일스톤 목록 조회
export const getGanttMilestones = (projectId) => {
    return axios.get(`/api/projects/${projectId}/ganttchart/milestones`);
};