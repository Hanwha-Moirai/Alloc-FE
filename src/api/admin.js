import axios from '@/lib/axios';

//사용자 목록 조회 (전체)
export const getAdminUsers = (params = {}) => {
    return axios.get('/api/admin/users', {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 10,
            keyword: params.keyword ?? null,
            auth: params.auth ?? null,     // ADMIN | PM | USER
            status: params.status ?? null  // ACTIVE | SUSPENDED | DELETED
        }
    });
};

//사용자 단건 조회
export const getAdminUserDetail = (userId) => {
    return axios.get(`/api/admin/users/${userId}`);
};

//사용자 생성 (Admin only)
export const createAdminUser = (data) => {
    return axios.post('/api/admin/users', {
        userName: data.userName,
        loginId: data.loginId,
        email: data.email,
        phone: data.phone,
        password: data.password,
        auth: data.auth,           // ADMIN | PM | USER
        status: data.status,       // ACTIVE | SUSPENDED
        birthday: data.birthday    // YYYY-MM-DD
    });
};

//사용자 정보 수정
export const updateAdminUser = (userId, data) => {
    return axios.patch(`/api/admin/users/${userId}`, {
        userName: data.userName,
        phone: data.phone,
        auth: data.auth,
        status: data.status,
        birthday: data.birthday
    });
};

//사용자 삭제 (Soft Delete)
export const deleteAdminUser = (userId) => {
    return axios.delete(`/api/admin/users/${userId}`);
};
