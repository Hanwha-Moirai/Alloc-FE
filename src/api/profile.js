import axios from '@/lib/axios';

// 프로필 요약 조회
export const fetchMyProfileSummary = () => {
    return axios.get('/api/users/me/summary');
};

// 기본 정보
export const fetchMyProfile = () => {
    return axios.get('/api/users/me/profile')
}

// 기술 스택
export const fetchMyTechStacks = () => {
    return axios.get('/api/users/me/tech-stacks')
}

// 기술 스택 수정
export const updateMyTechStacks = (payload) => {
    return axios.put('/api/users/me/tech-stacks', payload)
}

// 기술 스택 삭제
export const deleteMyTechStack = (employeeTechId) => {
    return axios.delete(`/api/users/me/tech-stacks/${employeeTechId}`)
}

// 기술 스택 추가
export const createMyTechStack = (payload) => {
    return axios.post('/api/users/me/tech-stacks', payload)
}

// 프로젝트 히스토리
export const fetchMyProjectHistory = (page = 0, size = 10) => {
    return axios.get('/api/users/me/project-history', {
        params: { page, size }
    })
}