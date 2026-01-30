import axios from '@/lib/axios'

// 상단 요약 카드
export const fetchHomeSummary = () => {
    return axios.get('/api/home/summary')
}

// 프로젝트 리스트
export const fetchHomeProjectList = () => {
    return axios.get('/api/home/projects')
}
