import { request } from '@umijs/max';
export async function getAnalysisStats() {
    return request('/rpa/data/parsing/stats', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function getAnalysisList(params: any) {
    return request('/rpa/data/parsing/page', {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}
export async function getAnalysisDetail(id: number) {
    return request(`/rpa/data/parsing/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}

export async function deleteAnalysisRecord(id: number) {
    return request(`/rpa/data/parsing/${id}`, {
        // baseURL: 'http://127.0.0.1:4523/m1/7697630-7440275-default',
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}