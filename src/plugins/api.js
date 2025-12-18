// api.js
import axios from 'axios';
import {apiMap} from './apiMap.js';

// 创建 axios 实例
const apiClient = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 60000,
});

// 存储外部依赖（如 message, router）
let external = {
    message: null,
    router: null,
};

// 提供设置外部依赖的方法（由 Vue 插件调用）
export function setExternal({message, router}) {
    external.message = message;
    external.router = router;
}

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers.token = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const {message, router} = external;
        const status = error.response?.status;
        const data = error.response?.data;

        console.error('[API Error]', {status, data, error});

        // 默认提示信息
        let errorMsg = '请求失败，请稍后重试';

        if (status === 401) {
            localStorage.removeItem('token');
            errorMsg = data?.message || data?.msg || '会话过期,请重新登录'
        } else if (status === 400) {
            errorMsg = data?.message || data?.msg || '请求参数错误';
        } else if (status === 403) {
            errorMsg = '无权限访问';
        } else if (status === 404) {
            errorMsg = '接口不存在';
        } else if (status === 500) {
            errorMsg = data?.message || data?.msg || '服务器内部错误';
        } else if (error.code === 'ECONNABORTED') {
            errorMsg = '请求超时';
        } else if (!error.response) {
            errorMsg = '网络连接失败，请检查网络';
        }
        message?.error(errorMsg);
        // toke过期跳转
        if (status === 401) router?.push('/Login').catch(() => {});

        return Promise.reject(error);
    }
);

// 工具函数：替换路径参数
function replacePathParams(path, params = {}) {
    return path.replace(/\{(\w+)\}/g, (match, key) => {
        if (params[key] === undefined) {
            console.warn(`[API] 缺少路径参数: {${key}} in ${path}`);
            return match;
        }
        return encodeURIComponent(params[key]);
    });
}

// 核心请求函数
// api.js
function request(apiId, params = {}, config = {}) {
    const apiDef = apiMap[apiId];
    if (!apiDef) {
        return Promise.reject(new Error(`未定义的接口 ID: ${apiId}`));
    }

    const {method, path} = apiDef;
    let url = replacePathParams(path, params);

    // 从 params 中移除路径参数
    const pathParams = [];
    path.replace(/\{(\w+)\}/g, (match, key) => {
        pathParams.push(key);
    });
    pathParams.forEach(key => delete params[key]);

    // 处理请求数据
    const requestData = method.toUpperCase() === 'GET' ? {params} : {data: params};

    return apiClient({url, method, ...requestData, ...config});
}

// 便捷方法
const api = {
    get: (id, params, config) => request(id, params, config),
    post: (id, data, config) => request(id, data, config),
    put: (id, data, config) => request(id, data, config),
    delete: (id, params, config) => request(id, params, config),
    request,
};

// Vue 插件
export default {
    install(app, options = {}) {
        // 注入 $api 到全局属性
        app.config.globalProperties.$api = api;

        // 提供给 Composition API 使用
        app.provide('$api', api);

        // 获取 message 和 router（需确保 Ant Design Vue 的 message 已全局注册）
        const message = options.message || window.$message; // 可通过 options 传入
        const router = options.router || app.config.globalProperties.$router;

        // 设置外部依赖
        setExternal({message, router});
    },
};