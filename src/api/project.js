import axios from '@/lib/axios'

export const fetchProjectList = () => {
    return axios.get('/api/projects')
}
