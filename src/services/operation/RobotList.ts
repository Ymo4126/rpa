import { request } from '@umijs/max';

export async function getRobotStatsdata() {
    return request('/rpa/bot/status', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function getRobotList(params: any) {
    return request('/rpa/bot/page', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}
export async function getRobotDetail(id: number) {
    return request(`/rpa/bot/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'GET',
    });
}
export async function addRobot(data: any) {
    return request('/rpa/bot', {
        baseURL: 'http://localhost:8080',
        method: 'POST',
        data,
    });
}
export async function updateRobot(id: number, data: any) {
    return request(`/rpa/bot/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'PUT',
        data,
    });
}
export async function deleteRobotData(id: number) {
    return request(`/rpa/bot/${id}`, {
        baseURL: 'http://localhost:8080',
        method: 'DELETE',
    });
}
//门供其他模块（如新建任务时的“绑定机器人”下拉框）作为数据源使用
export async function getRobotOptions(params: any) {
    return request('/rpa/bot/option', {
        baseURL: 'http://localhost:8080',
        method: 'GET',
        params,
    });
}