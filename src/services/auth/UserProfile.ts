import { request } from '@umijs/max';

export function login(data: any) {
    return request('/auth/login', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}
export function logout() {
    return request('/auth/logout', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
    });
}
export function getUserprofile() {
    return request('/sys/user/profile', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export function modifyUserprofile(data: any) {
    return request('/sys/user/profile', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export function modifyUserPassword(data: any) {
    return request('/sys/user/password', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}

export function uploadUserAvatar(data: FormData) {
    return request('/sys/user/avatar', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

