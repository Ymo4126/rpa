import { request } from '@umijs/max';
export function getResourceList(params: any) {
    return request('/sys/resource/tree', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params: params,
    });
}
export function addResource(data: any) {
    return request('/sys/resource', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}
export function updateResource(id: number, data: any) {
    return request(`/sys/resource/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export function deleteresource(id: number) {
    return request(`/sys/resource/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}
export function getResourceOptions() {
    return request('/sys/resource/options', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
