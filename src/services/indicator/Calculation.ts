import { request } from '@umijs/max';

export async function getIndicatorList(params: any) {
    return request('/index/indicator/page', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}

export async function getIndicatorDetail(id: number) {
    return request(`/index/indicator/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}

export async function addIndicator(data: any) {
    return request('/index/indicator', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}

export async function updateIndicator(id: number, data: any) {
    return request(`/index/indicator/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}

export async function deleteIndicator(id: number) {
    return request(`/index/indicator/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}

export async function getIndicatorOptions() {
    return request('/index/indicator/option', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
