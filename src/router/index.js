import { createRouter, createWebHistory } from 'vue-router'

// 레이아웃
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        /* 로그인 */
        {
            path: '/login',
            component: () => import('@/pages/Login.vue'),
        },
        {
            path: '/admin/login',
            component: () => import('@/pages/AdminLogin.vue'),
        },
        {
            path: '/password-reset',
            component: () => import('@/pages/PasswordReset.vue'),
        },

        /* 서비스 영역 */
        {
            path: '/',
            component: DefaultLayout,
            children: [
                {
                    path: '',
                    component: () => import('@/pages/Home.vue'),
                },
                {
                    path: '/profile/:userId',
                    component: () => import('@/pages/ProfileDetail.vue'),
                },
                {
                    path: '/home',
                    component: () => import('@/pages/Dashboard.vue'),
                },
                {
                    path: '/pm',
                    component: () => import('@/pages/PmDashboard.vue'),
                },
                {
                    path: 'projects',
                    component: () => import('@/pages/ProjectList.vue'),
                },
                {
                    path: '/projects/new',
                    component: () => import('@/pages/ProjectCreate.vue'),
                },
                {
                    path: 'projects/:projectId',
                    component: () => import('@/pages/ProjectDetail.vue'),
                    children: [
                        {
                            path: '',
                            component: () => import('@/pages/projectTabs/ProjectSummary.vue'),
                        },
                        {
                            path: 'tasks',
                            component: () => import('@/pages/projectTabs/ProjectTasks.vue'),
                        },
                        {
                            path: 'schedule',
                            component: () => import('@/pages/projectTabs/ProjectSchedule.vue'),
                        },
                        {
                            path: 'calendar',
                            component: () => import('@/pages/projectTabs/ProjectCalendar.vue'),
                        },
                        {
                            path: 'docs',
                            component: () => import('@/pages/projectTabs/ProjectDocuments.vue'),
                        },
                        {
                            path: 'docs/:type/:docId',
                            name: 'ProjectDocDetail',
                            component: () => import('@/pages/projectTabs/DocDetailView.vue'),
                            props: true
                        },
                        {
                            path: 'members',
                            component: () => import('@/pages/projectTabs/ProjectMembers.vue'),
                        },
                    ],
                },
                {
                    path: '/projects/recommend',
                    name: 'ProjectRecommend',
                    component: () => import('@/pages/RecommendResultView.vue'),
                },
            ],
        },
    ],
})

export default router
