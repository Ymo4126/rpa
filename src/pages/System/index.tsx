import { useLocation, useNavigate, useModel } from 'umi';
import { Layout, Menu } from 'antd';
import { Outlet } from 'react-router-dom';

const { Sider, Content } = Layout;

const System = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { initialState } = useModel('@@initialState');

    const menuItems = [
        {
            key: 'user-profile',
            label: '个人信息',
            code: 'sys:profile',
        },
        {
            key: 'user-management',
            label: '用户管理',
            code: 'sys:user:list',
        },
        {
            key: 'role-management',
            label: '角色管理',
            code: 'sys:role:list',
        },
        {
            key: 'resource-management',
            label: '资源管理',
            code: 'sys:resource:list',
        },
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1] || 'user-profile';
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
        navigate(`/sys/${key}`);
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

export default System;
