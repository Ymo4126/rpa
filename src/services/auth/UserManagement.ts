import { request } from '@umijs/max';
export function getUserList(params: any) {
    return request('/sys/user/page', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params: params,
    });
}

export function addUser(data: any) {
    return request('/sys/user', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}
export function updateUser(id: number, data: any) {
    return request(`/sys/user/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export function updateUserstatus(id: number, data: any) {
    return request(`/sys/user/${id}/status`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export function resetUserPassword(id: number) {
    return request(`/sys/user/${id}/password/reset`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'PUT'
    });
}
export function deleteuser(id: number) {
    return request(`/sys/user/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}
