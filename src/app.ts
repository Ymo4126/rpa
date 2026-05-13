// 运行时配置
import { message, Dropdown, Avatar } from 'antd';
import { LogoutOutlined } from "@ant-design/icons";
// import {logout} from "@/services/demo";
import { RequestConfig, history } from "@umijs/max";
import { logout } from './services/auth/UserProfile';

export async function getInitialState(): Promise<{ name: string; avatar?: string; menus?: any[]; permissions?: any[]; id?: number; realName?: string; }> {
  const token = localStorage.getItem('token');
  if (!token) {
    return { name: '', avatar: '' };
  }

  const menusStr = localStorage.getItem('menus');
  const menus = menusStr ? JSON.parse(menusStr) : [];
  const permissionsStr = localStorage.getItem('permissions');
  const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];

  return {
    name: '',
    avatar: '',
    menus,
    permissions,
    id: 1,
    realName: '超级管理员'
  };
}

export const layout = ({ initialState }) => {
  return {
    title: '重庆工程学院',
    layout: 'top',
    logout: async () => {
      const res = await logout();
      localStorage.removeItem('token');
      localStorage.removeItem('menus');
      localStorage.removeItem('permissions');
      message.success(res.message);
      history.push('/login');
    },
    menu: {
      locale: false,
      mode: 'horizontal',
      flatMenu: false,
      menuData: initialState?.menus || [],
    },




    token: {
      // 侧边栏样式配置
      sider: {
        colorMenuBackground: '#fff', // 菜单背景色
        colorTextMenuTitle: '#333', // 菜单标题文字颜色
        colorTextMenu: '#333', // 菜单项文字颜色
        colorTextMenuSelected: '#1890FF', // 选中菜单项文字颜色
        colorTextMenuItemHover: '#1890FF', // 鼠标悬停菜单项文字颜色
        colorBgMenuItemHover: 'rgba(24, 144, 255, 0.1)', // 鼠标悬停菜单项背景色
        colorBgMenuItemSelected: 'rgba(24, 144, 255, 0.1)', // 选中菜单项背景色
      },
      // 头部样式配置
      header: {
        colorBgHeader: '#5a9be4', // 头部背景色（深蓝色）
        colorHeaderTitle: '#fefefe', // 头部标题文字颜色
        heightLayoutHeader: 60, // 头部高度（单位：px）
        colorTextRightActionsItem: '#FFFFFF',
        colorTextMenu: '#FFFFFF',
        colorTextMenuSelected: '#001c36ff',
        colorBgMenuItemHover: 'rgba(255, 255, 255, 0.96)',
      },
      // 页面容器样式配置
      pageContainer: {
        paddingBlockPageContainerContent: 0, // 页面内容垂直内边距
        paddingInlinePageContainerContent: 0, // 页面内容水平内边距
      },
    },
  };
};
//请求配置项 
export const request: RequestConfig = {
  // baseURL: '/api',//统一前缀，用于proxy代理时方便统一管理
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  requestInterceptors: [
    (url: string, options: any) => {
      //将登录返回的用户凭证token添加到请求头
      //1. 从 localStorage 中获取 token
      const token = localStorage.getItem('token');
      //2. 如果 token 存在，将其添加到请求头
      if (token) {//判断token是否存在
        const headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
        return { url, options: { ...options, headers } };
      }
      // 在请求发送前做些什么
      return {
        url,
        options: { ...options, interceptors: true },
      };
    },
  ],
  responseInterceptors: [
    (response: any) => {
      // 在请求发送前做些什么
      switch (response.data.code) {
        case 200:
          return response;
        case 500:
          message.error(response.data.message || '系统繁忙，请稍后重试');
          return response;
        case 601:
          message.error(response.data.message || '业务处理失败');
          return response;
        default:
          message.error(response.data.message || '系统级异常或权限校验拦截');
          return response;
      }
    },
  ],
  errorConfig: {
    // 错误处理
    errorHandler: (error: any) => {
      // 错误处理
      let errMsg = '请求失败，请稍后重试';

      if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
        console.log(error.response.data.data);
      } else if (error?.message) {
        errMsg = error.message;
        // console.log(error);
      }

      message.error(errMsg);
    },
  },
};
