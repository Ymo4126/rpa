import { useLocation, useNavigate, useModel } from 'umi';
import { Layout, Menu } from 'antd';
import { Outlet } from 'react-router-dom';

const { Sider, Content } = Layout;

const Indicator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { initialState } = useModel('@@initialState');

    const menuItems = [
        {
            key: 'indicator-management',
            label: '指标管理',
            children: [
                {
                    key: 'indicator-calculation',
                    label: '指标计算',
                    code: 'indicator:calculation:list',
                },
                {
                    key: 'indicator-review',
                    label: '指标审核',
                    code: 'indicator:review:list',
                }
            ]
        }
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1] || 'indicator-review';
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
        navigate(`/indicator/${key}`);
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
                    defaultOpenKeys={['indicator-management']}
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

export default Indicator;
