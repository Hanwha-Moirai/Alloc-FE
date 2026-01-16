import axios from '@/lib/axios'

//프로젝트 목록 조회
export const fetchProjectList = () => {
    return axios.get('/api/projects')
}

//프로젝트 상세 조회
export const fetchProjectDetail = (projectId) => {
    return axios.get(`/api/projects/${projectId}`)
}