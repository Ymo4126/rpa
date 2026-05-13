import { request } from '@umijs/max';

export async function getTaskList(params: any) {
    return request('/rpa/task/page', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}

export async function getTaskDetail(id: number) {
    return request(`/rpa/task/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}

export async function addTaskRecord(data: any) {
    return request('/rpa/task', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}

export async function updateTaskRecord(id: number, data: any) {
    return request(`/rpa/task/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}

export async function executeTaskNow(id: number) {
    return request(`/rpa/task/${id}/execute`, {
        baseURL: 'http://localhost:8080',
        method: 'POST',
    });
}

export async function deleteTaskRecord(id: number) {
    return request(`/rpa/task/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}
