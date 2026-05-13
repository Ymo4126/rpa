import { request } from '@umijs/max';
export async function getDashboardStats() {
    return request('/rpa/dashboard/stats', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function getRecentTasks(params: any) {
    return request('/rpa/dashboard/recent-tasks', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}
export async function getSystemInfo() {
    return request('/sys/info', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
