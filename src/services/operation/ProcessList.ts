import { request } from '@umijs/max';


export async function getProcessList(params: any) {
    return request('/rpa/process/Page', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}
export async function getProcessDetail(id: number) {
    return request(`/rpa/process/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function addProcess(data: any) {
    return request('/rpa/process', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}
export async function updateProcessData(id: number, data: any) {
    return request(`/rpa/process/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export async function deleteProcessData(id: number) {
    return request(`/rpa/process/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}

export async function getProcessSteps(id: number) {
    return request(`/rpa/process/${id}/steps`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function updateProcessSteps(id: number, data: any) {
    return request(`/rpa/process/${id}/steps`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}

export async function getProcessOptions() {
    return request(`/rpa/process/option`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
