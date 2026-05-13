import { request } from '@umijs/max';

export async function getIndicatorReviewList(params: any) {
    return request('/index/audit/page', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}

export async function getAuditRuleDetail(id: number) {
    return request(`/index/audit/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}

export async function addAuditRule(data: any) {
    return request('/index/audit', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}

export async function updateAuditRule(id: number, data: any) {
    return request(`/index/audit/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}

export async function deleteAuditRule(id: number) {
    return request(`/index/audit/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}
