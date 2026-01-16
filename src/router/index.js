import { createRouter, createWebHistory } from 'vue-router'

// 레이아웃
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from "@/layouts/AdminLayout.vue";

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
                    path: 'my/profile',
                    component: () => import('@/pages/ProfileDetail.vue'),
                },
                {
                    path: '/profile/:userId',
                    component: () => import('@/pages/ProfileDetail.vue'),
                },
                {
                    path: '/home/user',
                    component: () => import('@/pages/Dashboard.vue'),
                },
                {
                    path: '/home/pm',
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
                            path: 'gantt',
                            component: () => import('@/pages/projectTabs/ProjectGantt.vue'),
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
                            path: 'docs/:type/create',
                            name: 'ProjectDocCreate',
                            component: () => import('@/pages/MeetingRecordCreate.vue'),
                        },
                        {
                            path: 'docs/:type/:docId',
                            name: 'ProjectDocDetail',
                            component: () => import('@/pages/projectTabs/DocDetailContainer.vue'),
                            props: true
                        },
                        {
                            path: 'members',
                            component: () => import('@/pages/projectTabs/ProjectMembers.vue'),
                        },
                        {
                            path: 'recommend',
                            name: 'ProjectRecommend',
                            component: () => import('@/pages/RecommendResultView.vue'),
                            props: true
                        },
                    ],
                },
                {
                    path: '/documents',
                    name: 'Documents',
                    component: () => import('@/pages/DocumentMain.vue'),
                },
                {
                    path: '/talent',
                    name: 'TalentSearch',
                    component: () => import('@/pages/TalentSearchView.vue'),
                },
            ],
        },

        /* 관리자 서비스 영역 */
        {
            path: '/admin',
            component: AdminLayout,
            children: [
                {
                    path: 'tech-stack',
                    name: 'AdminTechStack',
                    component: () => import('@/pages/admin/TechStackManagement.vue'),
                },
                {
                    path: 'jobs',
                    name: 'AdminJobs',
                    component: () => import('@/pages/admin/JobManagement.vue'),
                },
                {
                    path: 'users',
                    name: 'AdminUsers',
                    component: () => import('@/pages/admin/UserManagement.vue'),
                },
                {
                    path: 'audit',
                    name: 'AdminAudit',
                    component: () => import('@/pages/admin/AuditReport.vue'),
                },
                {
                    path: 'ranks',
                    name: 'AdminRanks',
                    component: () => import('@/pages/admin/RankManagement.vue'),
                },
            ],
        },
    ],
})

export default router
