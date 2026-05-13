import { request } from '@umijs/max';

export async function getTaskLogList(params: any) {
    return request('/rpa/task-log/page', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}
export async function getTaskLogDetail(id: number) {
    return request(`/rpa/task-log/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
