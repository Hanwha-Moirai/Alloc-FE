import axios from '@/lib/axios';

// 특정 프로젝트 내 주간보고 API
// 특정 프로젝트 내 주간보고 목록 조회
export const getWeeklyReports = (projectId, page = 0, size = 10) => {
    return axios.get(`/api/projects/${projectId}/docs/report`, {
        params: { page, size },
    });
};

// 특정 프로젝트 내 주간보고 검색
export const searchWeeklyReports = (projectId, params) => {
    return axios.get(`/api/projects/${projectId}/docs/report/search`, {
        params: {
            page: params.page || 0,
            size: params.size || 10,
            keyword: params.keyword || null,
            weekStartFrom: params.from || null, // 백엔드 파라미터명: weekStartFrom
            weekStartTo: params.to || null,     // 백엔드 파라미터명: weekStartTo
            reportStatus: params.status || null
        }
    });
};

// 특정 프로젝트 내 주간보고 상세 조회
export const getWeeklyReportDetail = (projectId, reportId) => {
    return axios.get(`/api/projects/${projectId}/docs/report/${reportId}`);
};

// 주간보고 생성
export const createWeeklyReport = (projectId, data) => {
    return axios.post(`/api/projects/${projectId}/docs/report/create`, data);
};

// 주간보고 수정 및 저장 (PATCH)
export const updateWeeklyReport = (projectId, data) => {
    // data에는 reportId, progressRate, completedTasks 등이 포함되어야 함
    return axios.patch(`/api/projects/${projectId}/docs/report/save`, data);
};

// 주간보고 삭제 (DELETE)
export const deleteWeeklyReport = (projectId, reportId) => {
    return axios.delete(`/api/projects/${projectId}/docs/report/delete`, {
        data: { reportId }
    });
};

// ---------------------------------------------------------------------------
// 내 주간보고(전체) API
// 내 모든 주간보고 목록 조회 (My Docs)
export const getMyWeeklyReports = (page = 0, size = 10) => {
    return axios.get('/api/mydocs/report', {
        params: { page, size }
    });
};

// 내 주간보고 검색 (My Docs)
export const searchMyWeeklyReports = (params) => {
    return axios.get('/api/mydocs/report/search', {
        params: {
            page: params.page || 0,
            size: params.size || 10,
            keyword: params.keyword || null,
            weekStartFrom: params.from || null,
            weekStartTo: params.to || null,
            projectId: params.projectId || null
        }
    });
};

// 미작성 주간보고 조회
export const getMissingWeeklyReports = (projectId, params) => {
    return axios.get(`/api/projects/${projectId}/docs/report/missing`, {
        params: {
            startDate: params.startDate,
            endDate: params.endDate
        }
    })
}

export const getWeeklyReportLogs = (projectId, params = {}) => {
    return axios.get(`/api/projects/${projectId}/docs/report/logs`, {
        params
    })
}
