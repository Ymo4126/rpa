import { request } from '@umijs/max';
export async function getCollectionStats() {
    return request('/rpa/data/collection/stats', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function getCollectionList(params: any) {
    return request('/rpa/data/collection/page', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}
export async function getCollectionDetail(id: number) {
    return request(`/rpa/data/collection/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function addCollectionRecord(data: any) {
    return request('/rpa/data/collection', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}
export async function deleteCollectionRecord(id: number) {
    return request(`/rpa/data/collection/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}