import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

// 리스크 리포트 목록
export const fetchRiskReports = (projectId, page = 1, size = 20) => {
    return api.get(`/api/projects/${projectId}/docs/risk_reports`, {
        params: { page, size },
    });
};

// 리스크 리포트 상세
export const fetchRiskReportDetail = (projectId, reportId) => {
    return api.get(
        `/api/projects/${projectId}/docs/risk_reports/${reportId}`
    );
};

// 리스크 리포트 생성
export const createRiskReport = (projectId, payload) => {
    return api.post(`/api/projects/${projectId}/docs/risk_report`, payload);
};
