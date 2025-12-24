import {createRouter, createWebHistory} from 'vue-router'

export const loginRouter = {
    path: '/',
    name: 'Login',
    alias: '/Login',
    meta: {title: '登录'},
    component: () => import('@/views/login/UserLogin.vue'),
}

export const registerRouter = {
    path: '/Register',
    name: 'Register',
    meta: {title: '新用户注册'},
    component: () => import('@/views/login/UserRegister.vue'),
}

// export const forgotPwdRouter = {
//     path: '/ForgotPassword',
//     name: 'ForgotPassword',
//     meta: {title: '忘记密码'},
// }

export const rootRouter = {
    path: '/Home',
    name: 'Home',
    redirect: '/Home/Index',
    component: () => import('@/views/HomeIndex.vue'),
    children: [
        {name: 'Index', path: 'Index', component: () => import('@/views/system/HomePage.vue')},
        {name: 'SystemList', path: 'SystemList', component: () => import('@/views/system/SystemList.vue')},
        {name: 'RoleList', path: 'RoleList', component: () => import('@/views/system/RoleList.vue')},
        {name: 'PermissionList', path: 'PermissionList', component: () => import('@/views/system/PermissionList.vue')},
        {name: 'UserList', path: 'UserList', component: () => import('@/views/user/UserList.vue')},
        {name: 'ProdList', path: 'ProdList', component: () => import('@/views/prod/ProdList.vue')},
        {name: 'ProdTag', path: 'ProdTag', component: () => import('@/views/prodtag/ProdTag.vue')},
        {name: 'ProdStock', path: 'ProdStock', component: () => import('@/views/prodstock/ProdStock.vue')},
    ],
}

export const Test = {
    path: '/Test',
    name: 'Test',
    component: () => import('@/views/temp.vue')
}

export const NotFoundRouter = {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/system/NotFound.vue'),
}

// 定义的路由都放在该常量中
export const routes = [
    loginRouter, registerRouter, rootRouter,
    Test, NotFoundRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局后置钩子：每次路由切换后执行
router.afterEach((to) => {
    // 默认标题前缀
    const defaultTitle = 'XX后台系统'
    // 如果路由有 meta.title，则使用它；否则用name+默认标题
    document.title = to.meta.title ? `${defaultTitle} - ${to.meta.title}` : `${defaultTitle} - ${to.name}`
})

export default router