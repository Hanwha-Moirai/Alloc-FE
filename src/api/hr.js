import axios from '@/lib/axios'

export const fetchTechStacks = (params = {}) => {
    return axios.get('/api/hr/tech-stacks', { params })
}

export const fetchJobs = () => {
    return axios.get('/api/hr/jobs')
}