import { createRouter, createWebHistory } from 'vue-router'

// 레이아웃
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        /* 로그인 */
        {
            path: '/login',
            component: () => import('@/pages/Login.vue'),
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
                    path: '/home',
                    redirect: async () => {
                        const authStore = useAuthStore(pinia)

                        if (!authStore.user) {
                            try {
                                await authStore.fetchMe()
                            } catch {
                                return '/login'
                            }
                        }

                        return authStore.role === 'PM'
                            ? '/home/pm'
                            : '/home/user'
                    }
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
                            path: 'docs/weekly/create',
                            name: 'WeeklyReportCreate',
                            component: () => import('@/pages/WeeklyReportCreate.vue'),
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
                            path: 'assign',
                            name: 'ProjectAssign',
                            component: () => import('@/pages/ProjectAssign.vue'),
                            props: true
                        },
                        {
                            path: 'risk',
                            component: () => import('@/pages/projectTabs/ProjectRisk.vue')
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

router.beforeEach(async (to) => {
    const authStore = useAuthStore(pinia)
    const publicPages = ['/login', '/password-reset']
    const isPublicPage = publicPages.includes(to.path)

    // 로그인 필요한 페이지
    if (!authStore.user && !isPublicPage) {
        try {
            await authStore.fetchMe()
        } catch {
            return '/login'
        }
    }

    // 로그인 상태로 로그인 페이지 접근
    if (authStore.user && to.path === '/login') {
        return authStore.role === 'PM'
            ? '/home/pm'
            : '/home/user'
    }

    return true
})

export default router
