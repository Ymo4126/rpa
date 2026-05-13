import { getResourceList, getResourceOptions } from '@/services/auth/ResourceManagement';
import { formatTime } from '@/utils/timeFormat';
import { addRole, deleterole, getRoleList, getRoleresources, updateRoleResources, updateRole } from '@/services/auth/RoleManagement';
import { Typography, Card, Button, Col, Row, Avatar, Space, Descriptions, Form, Input, Select, Table, Modal, Radio, message, Tag, Tree, Tooltip } from 'antd';
import { TreeDataNode } from 'antd';
import { useAccess } from '@umijs/max';

import { useEffect, useState } from 'react';
const { Title } = Typography;


const RoleManagement = () => {
    const access = useAccess();
    const columns = [
        {
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '角色编码',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
        },

        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                text.length > 5 ? `${text.substring(0, 5)}...` : text
            ),
        },
        {
            title: '权限',
            dataIndex: 'permissionSummary',
            key: 'permissionSummary',
        },
        {
            title: '用户数',
            dataIndex: 'userCount',
            key: 'userCount',
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text) => {
                return (text === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>);
            }
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => formatTime(text),
        }, {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 240,
            render: (text, record) => (
                <Space>
                    {access['sys:role:edit'] ? (
                        <Button type='link' onClick={() => updateRoleinfo(record)}>编辑</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' disabled style={{ color: 'gray' }}>编辑</Button>
                        </Tooltip>
                    )}
                    {access['sys:role:auth'] ? (
                        <Button type='link' style={{ color: '#997800d4' }} onClick={() => showModalPermission(record)}>分配权限</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>分配权限</Button>
                        </Tooltip>
                    )}
                    {access['sys:role:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => deleteRole(record)}>删除</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>删除</Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        }
    ]
    const data = [
        {
            index: 1,
            roleCode: 'admin',
            roleName: '管理员',
            description: '系统管理员角色',
            permissions: ['user:read', 'user:write'],
            userCount: 10,
            status: 0,
            createTime: '2023-01-01',
        }
    ]
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const handleChange = (page: number, size: number) => {
        setPageNum(page);
        setPageSize(size);
    };

    //功能部分-------------------------------------------------
    const [dataSource, setDataSource] = useState([]);
    const [searchForm] = Form.useForm();
    const reset = () => {
        searchForm.resetFields(['name', 'code']);
        getData();
    }
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [permissionForm] = Form.useForm();
    const [checkedKeys, setCheckedKeys] = useState([]);

    const [roleResources, setRoleResources] = useState([]);
    const [resourceTreeData, setResourceTreeData] = useState([]);
    const [record, setRecord] = useState(0);
    const getRoleResources = async (id: number) => {
        try {
            const res = await getRoleresources(id);
            setRoleResources(res.data || []);
            setRecord(id);
            setCheckedKeys(res.data || []);
            console.log(roleResources);
        } catch (error) {
            console.error('获取角色资源失败:', error);
        }
    }
    const getResourceListData = async () => {
        try {
            const res = await getResourceList({});
            const transformedData = transformToTreeData(res.data || []);
            setResourceTreeData(transformedData);
        } catch (error) {
            console.error('获取资源列表失败:', error);
        }
    }
    const transformToTreeData = (nodes: any[]) => {
        return nodes.map(node => ({
            title: node.name,
            key: node.id,
            children: node.children ? transformToTreeData(node.children) : []
        }));
    }
    const permissionOk = async () => {
        console.log('选中的树状数据:', checkedKeys);

        try {
            const res = await updateRoleResources(record, { resourceIds: checkedKeys });
            message.success('更新角色资源成功');

            // 角色权限变更后提示重新登录
            Modal.info({
                title: '权限已变更',
                content: '角色权限已修改，请重新登录以使新权限生效。',
                okText: '重新登录',
                onOk: () => {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            });
        } catch (error) {
            console.error('更新角色资源失败:', error);
        }

        setPermissionOpen(false);
        permissionForm.resetFields();
        setCheckedKeys([]);
        setResourceTreeData([]);
    };
    const permissionCancel = () => {
        setPermissionOpen(false);
        permissionForm.resetFields();
        setCheckedKeys([]);
        setResourceTreeData([]);
    };
    const showModalPermission = (record) => {
        getRoleResources(record.id);
        getResourceListData();
        setPermissionOpen(true);
    };
    const showModal = () => { setOpen(true); };
    const ok = () => { addForm.submit(); };
    const [editRole, setEditRole] = useState(null);
    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
        setEditRole(null);
    }
    const getData = async () => {
        try {
            const res = await getRoleList({ pageNum, pageSize });
            setTotal(res.data.total || 0);
            setDataSource(res.data.records || []);
        } catch (error) {
            console.error('获取角色列表失败:', error);
        }
    };
    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);
    const searchRole = async (values) => {
        try {
            setPageNum(1);
            const searchParams = { ...values };
            const res = await getRoleList({ pageNum: 1, pageSize, ...searchParams });
            setTotal(res.data.total || 0);
            setDataSource(res.data.records || []);
        } catch (error) {
            console.error('搜索角色失败:', error);
        }
    }

    const roleOperation = async (values) => {

        if (!values.code) {
            message.error('请输入角色编码');
            return;
        }
        if (!values.name) {
            message.error('请输入角色名称');
            return;
        }
        if (!values.description) {
            message.error('请输入角色描述');
            return;
        }
        if (values.status === undefined || values.status === null) {
            message.error('请选择角色状态');
            return;
        }
        try {
            let res = null;
            if (editRole) {
                const updateDate = { ...values, id: editRole.id }
                res = await updateRole(updateDate);
            } else {
                res = await addRole(values);
            }

            getData();
            setOpen(false);
            addForm.resetFields();
            setEditRole(null);
            message.success(editRole ? '编辑角色成功' : '新增角色成功');
        } catch (error) {
            console.error('角色操作失败:', error);
        }
    };
    const updateRoleinfo = (record) => {
        const editRole = { ...record }
        setEditRole(editRole);
        setOpen(true);
        addForm.setFieldsValue(editRole);
    }
    const deleteRole = (record) => {
        Modal.confirm({
            title: '是否确认删除角色？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleterole(record.id);
                    getData();
                    message.success('删除角色成功');
                } catch (error) {
                    console.error(error);
                    message.error('删除角色失败');
                }
            },
        });
    }





    return (
        <>
            <Title level={4}>角色管理</Title>
            {access['sys:role:add'] ? (
                <Button type='primary' style={{ marginBottom: 16 }} onClick={showModal}>添加角色</Button>
            ) : (
                <Tooltip title="无权限" key="add-role-tooltip">
                    <Button type='primary' style={{ marginBottom: 16 }} disabled>添加角色</Button>
                </Tooltip>
            )}
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' form={searchForm} onFinish={searchRole}>
                    <Form.Item label='角色名称' name='name' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='角色编码' name='code'>
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Button type='primary' htmlType='submit'>查询</Button>
                    <Button style={{ marginLeft: 8 }} onClick={reset}>重置</Button>
                </Form>
            </Card>
            <Table
                columns={columns}
                dataSource={dataSource}
                scroll={{ x: 1300 }}
                pagination={{
                    current: pageNum,
                    pageSize: pageSize,
                    total: total,
                    onChange: handleChange,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
            />

            <Modal
                title={editRole ? "编辑角色" : "新增角色"}
                okText="确定"
                cancelText="取消"
                open={open}
                onOk={ok}
                onCancel={cancel}
            >
                <Form form={addForm} onFinish={roleOperation} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} initialValues={{ status: 1 }}>
                    <Form.Item label="角色编码" name="code">
                        <Input placeholder="请输入角色编码" disabled={!!editRole} />
                    </Form.Item>
                    <Form.Item label="角色名称" name="name">
                        <Input placeholder="请输入角色名称" />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input.TextArea rows={4} placeholder="请输入角色描述" />
                    </Form.Item>
                    <Form.Item label="状态" name="status" >
                        <Radio.Group options={[
                            { label: '启用', value: 1 },
                            { label: '禁用', value: 0 }]}>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="分配权限"
                okText="确定"
                cancelText="取消"
                open={permissionOpen}
                onOk={permissionOk}
                onCancel={permissionCancel}>
                <Tree
                    checkable
                    defaultExpandAll
                    treeData={resourceTreeData}
                    checkedKeys={checkedKeys}
                    blockNode
                    // checkStrictly
                    onCheck={(checkedKeysValue) => setCheckedKeys(checkedKeysValue)}
                />


            </Modal>
        </>

    )
};
export default RoleManagement;
//差分配权限获取提交为假数据 条件查询有问题
