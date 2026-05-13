import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'RPA系统',
  },
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      name: '登录',
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      name: '首页',
      path: '/dashboard',
      component: './Home',
      access: 'dashboard',
    },
    {
      name: 'RPA运营管理',
      path: '/rpa',
      component: './Operation',
      access: 'rpa',
      routes: [
        {
          path: 'task-list',
          component: './Operation/components/TaskList',
          access: 'rpa:task:list',
        },
        {
          path: 'process-execution',
          component: './Operation/components/ExecutionRecord',
          access: 'rpa:task-log:list',
        },
        {
          path: 'robot-list',
          component: './Operation/components/RobotList',
          access: 'rpa:bot:list',
        },
        {
          path: 'process-definition',
          component: './Operation/components/ProcessList',
          access: 'rpa:process:list',
        },
        {
          path: 'data-collection',
          component: './Operation/components/DataCollection',
          access: 'rpa:data:collection:list',
        },
        {
          path: 'data-parsing',
          component: './Operation/components/DataAnalysis',
          access: 'rpa:data:parsing:list',
        },
        {
          path: 'data-processing',
          component: './Operation/components/DataProcessing',
          access: 'rpa:data:processing:list',
        },
        {
          path: 'data-query',
          component: './Operation/components/DataQuery',
          access: 'rpa:data:query:list',
        },
        {
          path: '',
          redirect: 'task-list',
        },
      ],
    },
    {
      name: '指标管理',
      path: '/indicator',
      component: './Indicator',
      access: 'indicator',
      routes: [
        {
          path: 'indicator-calculation',
          component: './Indicator/components/Indicator-calculation',
          access: 'indicator:calculation:list',
        },
        {
          path: 'indicator-review',
          component: './Indicator/components/Indicator-review',
          access: 'indicator:review:list',
        },
        {
          path: '',
          redirect: 'indicator-calculation',
        },
      ],
    },
    {
      name: '系统管理',
      path: '/sys',
      component: './System',
      access: 'sys',
      routes: [
        {
          path: 'user-profile',
          component: './System/components/User-profile',
          access: 'sys:profile',
        },
        {
          path: 'user-management',
          component: './System/components/User-management',
          access: 'sys:user:list',
        },
        {
          path: 'role-management',
          component: './System/components/Role-management',
          access: 'sys:role:list',
        },
        {
          path: 'resource-management',
          component: './System/components/Resource-management',
          access: 'sys:resource:list',
        },
        {
          path: '',
          redirect: 'user-profile',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
});

