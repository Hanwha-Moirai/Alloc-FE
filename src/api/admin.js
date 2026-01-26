import axios from '@/lib/axios';

//사용자 목록 조회 (전체)
export const getAdminUsers = (params = {}) => {
    return axios.get('/api/admin/users', {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 10,
            q: params.q ?? params.keyword ?? null,
            role: params.role ?? params.auth ?? null,
            status: params.status ?? null
        }
    });
};

// 유저 상세 조회
export const getAdminUserDetail = (userId) => {
    return axios.get(`/api/admin/users/${userId}`);
};

//사용자 생성 (Admin only)
export const createAdminUser = (data) => {
    return axios.post('/api/admin/users', {
        loginId: data.loginId,
        password: data.password,
        userName: data.userName,
        email: data.email,
        phone: data.phone,

        birthday: data.birthday,
        hiringDate: data.hiringDate,

        employeeType: data.employeeType,
        auth: data.auth,
        status: data.status,

        jobId: data.jobId,
        deptId: data.deptId,
        titleStandardId: data.titleStandardId
    });
};

// 사용자 정보 수정
export const updateAdminUser = (userId, data) => {
    return axios.patch(`/api/admin/users/${userId}`, {
        userName: data.userName,
        phone: data.phone,
        auth: data.auth,
        status: data.status,
        birthday: data.birthday,

        employeeType: data.employeeType,
        jobId: data.jobId,
        deptId: data.deptId,
        titleStandardId: data.titleStandardId
    });
};

//사용자 삭제 (Soft Delete)
export const deleteAdminUser = (userId) => {
    return axios.delete(`/api/admin/users/${userId}`);
};

// 사용자 등록/수정 시 필요한 메타 데이터(근무형태, 권한, 상태 등) 조회
export const getAdminUserMeta = () => {
    return axios.get('/api/admin/users/meta');
};

//기술 스택 목록 조회
export const getAdminTechStacks = (params) => {
    return axios.get('/api/admin/tech-stacks', { params });
};

//기술 스택 신규 등록
export const createAdminTechStack = (data) => {
    return axios.post('/api/admin/tech-stacks', data);
};

//기술 스택 정보 수정
export const updateAdminTechStack = (stackId, data) => {
    return axios.patch(`/api/admin/tech-stacks/${stackId}`, data);
};

//기술 스택 삭제
export const deleteAdminTechStack = (stackId) => {
    return axios.delete(`/api/admin/tech-stacks/${stackId}`);
};

// 직급 목록 조회
export const getAdminTitles = (params) => {
    return axios.get('/api/admin/title_standard', { params });
};

// 직급 등록
export const createAdminTitle = (data) => {
    return axios.post('/api/admin/titles', data);
};

// 직급 수정
export const updateAdminTitle = (id, data) => {
    return axios.patch(`/api/admin/titles/${id}`, data);
};

// 직무 목록 조회
export const getAdminJobs = (params) => {
    return axios.get('/api/admin/jobs', {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 10,
            q: params.q ?? null // 검색어
        }
    });
};

// 직무 신규 등록
export const createAdminJob = (data) => {
    return axios.post('/api/admin/jobs', {
        jobName: data.jobName
    });
};

// 직무 정보 수정
export const updateAdminJob = (jobId, data) => {
    return axios.patch(`/api/admin/jobs/${jobId}`, {
        jobName: data.jobName
    });
};

// 직무 삭제
export const deleteAdminJob = (jobId) => {
    return axios.delete(`/api/admin/jobs/${jobId}`);
};