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

// 프로젝트 히스토리
export const fetchMyProjectHistory = (page = 0, size = 10) => {
    return axios.get('/api/users/me/project-history', {
        params: { page, size }
    })
}