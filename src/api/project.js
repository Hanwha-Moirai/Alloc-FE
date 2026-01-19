import axios from '@/lib/axios'

//프로젝트 목록 조회
export const fetchProjectList = () => {
    return axios.get('/api/projects')
}

//프로젝트 상세 조회
export const fetchProjectDetail = (projectId) => {
    return axios.get(`/api/projects/${projectId}`)
}

// 프로젝트 수정
export const updateProject = (projectId, payload) => {
    return axios.put(`/api/projects/${projectId}`, payload)
}

// 프로젝트 등록
export const createProject = (data) => {
    return axios.post('/api/projects', data)
}

//참여된 프로젝트 인원 조회
export const getAssignedMembers = (projectId) => {
    return axios.get(`/api/projects/${projectId}/assignments/assigned`)
}