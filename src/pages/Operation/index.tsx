import { useLocation, useNavigate, useModel } from 'umi';
import { Layout, Menu } from 'antd';
import { Outlet } from 'react-router-dom';

const { Sider, Content } = Layout;

const Operation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { initialState } = useModel('@@initialState');

    const menuItems = [
        {
            key: 'task',
            label: '任务管理',
            code: 'rpa:task:dir',
            children: [
                {
                    key: 'task-list',
                    label: '任务列表',
                    code: 'rpa:task:list',
                },
                {
                    key: 'process-execution',
                    label: '执行记录',
                    code: 'rpa:task-log:list',
                },
            ],
        },
        {
            key: 'robot',
            label: '机器人管理',
            code: 'rpa:bot:dir',
            children: [
                {
                    key: 'robot-list',
                    label: '机器人列表',
                    code: 'rpa:bot:list',
                },
            ],
        },
        {
            key: 'process',
            label: '流程管理',
            code: 'rpa:process:dir',
            children: [
                {
                    key: 'process-definition',
                    label: '流程列表',
                    code: 'rpa:process:list',
                },
            ],
        },
        {
            key: 'data',
            label: '数据管理',
            code: 'rpa:data:dir',
            children: [
                {
                    key: 'data-collection',
                    label: '数据采集',
                    code: 'rpa:data:collection:list',
                },
                {
                    key: 'data-parsing',
                    label: '数据解析',
                    code: 'rpa:data:parsing:list',
                },
                {
                    key: 'data-processing',
                    label: '数据加工',
                    code: 'rpa:data:processing:list',
                },
                {
                    key: 'data-query',
                    label: '数据查询',
                    code: 'rpa:data:query:list',
                },
            ],
        },
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1] || 'task-list';
    };

    const filterMenuItems = (items: any[]) => {
        if (!initialState?.menus) return items;

        const permissions = new Set<string>();
        const extractPermissions = (menus: any[]) => {
            menus.forEach(menu => {
                if (menu.code) {
                    permissions.add(menu.code);
                }
                if (menu.children) {
                    extractPermissions(menu.children);
                }
            });
        };
        extractPermissions(initialState.menus);

        return items.filter(item => {
            if (item.code && !permissions.has(item.code)) {
                return false;
            }
            if (item.children) {
                item.children = filterMenuItems(item.children);
                return item.children.length > 0;
            }
            return true;
        });
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'task' || key === 'robot' || key === 'process' || key === 'data') {
            return;
        }
        navigate(`/rpa/${key}`);
    };

    return (
        <Layout style={{ height: 'calc(100vh - 64px)' }}>
            <Sider width={200} style={{
                background: '#fff',
                position: 'fixed',
                height: 'calc(100vh - 64px)',
                overflow: 'auto'
            }}>
                <Menu
                    mode="inline"
                    selectedKeys={[getSelectedKey()]}
                    defaultOpenKeys={['task', 'robot', 'process', 'data']}
                    onClick={handleMenuClick}
                    items={filterMenuItems(menuItems)}
                    style={{ height: '100%', borderRight: 0 }}
                />
            </Sider>
            <Layout style={{ padding: '24px 24px', marginLeft: 200 }}>
                <Content><Outlet /></Content>
            </Layout>
        </Layout>
    );
};

export default Operation;
