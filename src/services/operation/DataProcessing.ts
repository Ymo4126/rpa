import { request } from '@umijs/max';
export async function getProcessingStats() {
    return request('/rpa/data/processing/stats', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function getProcessingList(params: any) {
    return request('/rpa/data/processing/page', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}
export async function getProcessingDetail(id: number) {
    return request(`/rpa/data/processing/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}

export async function deleteProcessingRecord(id: number) {
    return request(`/rpa/data/processing/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}