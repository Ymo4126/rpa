import { request } from '@umijs/max';

export async function getTaskOptions() {
    return request('/rpa/data/query/task-options', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
