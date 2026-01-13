import axios from '@/lib/axios';

// 내 주간보고 목록 조회 (일반)
export const getMyWeeklyReports = (page = 0, size = 10) => {
    return axios.get('/api/mydocs/report', {
        params: { page, size }
    });
};

// 내 주간보고 검색 (keyword, weekStartFrom, weekStartTo 등)
export const searchMyWeeklyReports = (params) => {
    return axios.get('/api/mydocs/report/search', {
        params: {
            page: params.page || 0,
            size: params.size || 10,
            keyword: params.keyword || null,
            weekStartFrom: params.from || null, // 백엔드 @RequestParam 이름에 맞춤
            weekStartTo: params.to || null
        }
    });
};