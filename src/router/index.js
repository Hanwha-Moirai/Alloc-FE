import { createRouter, createWebHistory } from 'vue-router'

// 레이아웃
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from "@/layouts/AdminLayout.vue";
import {jwtDecode} from "jwt-decode";

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
                    path: '/',
                    redirect: () => {
                        console.log('[ / redirect ]')

                        const token = localStorage.getItem('accessToken')
                        if (!token) {
                            console.log('→ no token')
                            return '/login'
                        }

                        try {
                            const payload = jwtDecode(token)
                            console.log('payload:', payload)

                            const role = payload.role
                            console.log('role:', role)

                            return role === 'PM' ? '/home/pm' : '/home/user'
                        } catch (e) {
                            console.error('jwt decode failed', e)
                            return '/login'
                        }
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

router.beforeEach((to, from, next) => {
    // 로컬 스토리지에서 액세스 토큰 확인
    const token = localStorage.getItem('accessToken');

    // 인증이 필요 없는 경로 설정
    const publicPages = ['/login', '/password-reset'];
    const authRequired = !publicPages.includes(to.path);

    // 인증이 필요한 페이지에 접근하는데 토큰이 없는 경우
    if (authRequired && !token) {
        console.warn('인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.');

        // 만약 일반 서비스 영역('/')으로 가려 했다면 /login으로,
        // 어드민 영역('/admin')으로 가려 했다면 /admin/login으로 보낼 수 있음
        if (to.path.startsWith('/admin')) {
            return next('/admin/login');
        }
        return next('/login');
    }

    // 이미 로그인이 되어 있는데 로그인 페이지에 접근하는 경우 (홈으로 리다이렉트)
    if (token && (to.path === '/login' || to.path === '/admin/login')) {
        return next('/');
    }

    // 그 외에는 정상적으로 이동 허용
    next();
});

export default router
