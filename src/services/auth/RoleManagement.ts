import { request } from '@umijs/max';
export function getRoleList(params: any) {
    return request('/sys/role/page', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params: params,
    });
}
export function addRole(data: any) {
    return request('/sys/role', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}

export function updateRole(data: any) {
    return request(`/sys/role/${data.id}`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export function deleterole(id: number) {
    return request(`/sys/role/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}
export function getRoleresources(id: number) {
    return request(`/sys/role/${id}/resources`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export function updateRoleResources(id: number, data: any) {
    return request(`/sys/role/${id}/resources`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export function getRoleOptions() {
    return request('/sys/role/options', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
