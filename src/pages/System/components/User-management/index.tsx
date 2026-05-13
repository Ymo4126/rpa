import { Typography, Card, Button, Col, Row, Avatar, Space, Descriptions, Form, Input, Select, Table, Modal, message, Checkbox, Radio, Tag, Tooltip } from 'antd';
import { formatTime } from '@/utils/timeFormat';
import { useEffect, useState } from 'react';
import { useAccess } from '@umijs/max';
const { Title } = Typography;
import { getUserList, addUser, updateUserstatus, resetUserPassword, deleteuser, updateUser } from '@/services/auth/UserManagement';
import { getRoleOptions } from '@/services/auth/RoleManagement';
const { TextArea } = Input;

const UserManagement = () => {
    const access = useAccess();
    const columns = [
        {
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '姓名',
            dataIndex: 'realName',
            key: 'realName',
        },

        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '角色',
            dataIndex: 'roleNames',
            key: 'roleNames',
            render: (text) => {
                return text ? text.join('、 ') : '';
            }
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
        },{
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 320,
            render: (text, record) => (
                <Space>
                    {access['sys:user:edit'] ? (
                        <Button type='link' onClick={() => updateUserinfo(record)}>编辑</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' disabled style={{ color: 'gray' }}>编辑</Button>
                        </Tooltip>
                    )}
                    {access['sys:user:reset-pwd'] ? (
                        <Button type='link' style={{ color: '#997800d4' }} onClick={() => resetPassword(record)}>重置密码</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>重置密码</Button>
                        </Tooltip>
                    )}
                    {access['sys:user:status'] ? (
                        <Button type='link' style={{ color: '#a50303d0' }} onClick={() => updateUserStatus(record)}>{record.status === 1 ? '禁用' : '启用'}</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>{record.status === 1 ? '禁用' : '启用'}</Button>
                        </Tooltip>
                    )}
                    {access['sys:user:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => deleteUser(record)}>删除</Button>
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
            username: 'admin',
            name: '管理员',
            email: 'admin@example.com',
            phone: '12345678901',
            role: 'admin',
            status: 0,
            createTime: '2023-01-01',
        },
        {
            index: 2,
            username: 'user',
            name: '普通用户',
            email: 'user@example.com',
            phone: '12345678902',
            role: 'user',
            status: 1,
            createTime: '2023-01-02',
        },
    ]

    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [roleOptions, setRoleOptions] = useState<{ label: string; value: number }[]>([]);
    const handleChange = (page: number, size: number) => {
        setPageNum(page);
        setPageSize(size);
    };
    const fetchRoleOptions = async () => {
        try {
            const res = await getRoleOptions();
            if (res.code === 200) {
                const options = res.data.map((item: any) => ({
                    label: item.name,
                    value: item.id
                }));
                setRoleOptions(options);
            }
        } catch (error) {
            console.error('获取角色列表失败:', error);
        }
    };
    useEffect(() => {

        fetchRoleOptions();
    }, []);

    //功能部分-------------------------------------------------
    const [dataSource, setDataSource] = useState([]);
    const [searchForm] = Form.useForm();
    const reset = () => {
        searchForm.resetFields(['username', 'name', 'roleId']);
        getData();
    }
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const showModal = () => { setOpen(true); };
    const ok = () => { addForm.submit(); };
    const [editUser, setEditUser] = useState(null);
    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
        setEditUser(null);
    }
    const getData = async (page = pageNum, size = pageSize) => {
        try {
            const res = await getUserList({ pageNum: page, pageSize: size });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取用户列表失败:', error);
        }
    };
    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);

    const searchUser = async (values) => {
        try {
            setPageNum(1);
            const searchParams = {
                pageNum: 1,
                pageSize: pageSize,
                ...values,
                realName: values.realName,
                username: values.username,
                roleId: values.roleId
            };
            const res = await getUserList(searchParams);
            console.log(res);
            setTotal(res.data.total || 0);
            setDataSource(res.data.records || []);
            message.success('搜索成功');
        } catch (error) {
            console.error('搜索用户失败:', error);
        }
    }
    const userOperation = async (values) => {
        if (!values.username) {
            message.error('请输入用户名');
            return;
        }
        if (!values.realName) {
            message.error('请输入姓名');
            return;
        }
        if (!values.email) {
            message.error('请输入邮箱');
            return;
        }
        if (!values.phone) {
            message.error('请输入手机号');
            return;
        }
        if (!values.roleIds || values.roleIds.length === 0) {
            message.error('请选择用户角色');
            return;
        }
        if (values.status === undefined || values.status === null) {
            message.error('请选择用户状态');
            return;
        }
        try {
            let res = null;
            const submitValues = { ...values, id: editUser?.id, roleIds: values.roleIds };
            if (editUser) {
                res = await updateUser(editUser.id, submitValues);
            } else {
                if (!values.password) {
                    message.error('请输入用户密码');
                    return;
                }
                res = await addUser(submitValues);
            }
            getData();
            setOpen(false);
            addForm.resetFields();
            setEditUser(null);
            message.success(editUser ? '编辑用户成功' : '新增用户成功');

            // 编辑用户时提示重新登录（可能修改了角色）
            if (editUser) {
                Modal.info({
                    title: '用户信息已变更',
                    content: '用户角色已修改，请重新登录以使新权限生效。',
                    okText: '重新登录',
                    onOk: () => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }
                });
            }
        } catch (error) {
            console.error('用户操作失败:', error);
        }
    };
    const updateUserinfo = (record) => {
        const editUser = { ...record };
        if (editUser.roleNames && !editUser.roleIds) {
            const roleIds = roleOptions
                .filter(option => editUser.roleNames.includes(option.label))
                .map(option => option.value);
            editUser.roleIds = roleIds;
        } else if (editUser.roleIds) {
            editUser.roleIds = Array.isArray(editUser.roleIds) ? editUser.roleIds : [editUser.roleIds];
        }
        setEditUser(editUser);
        setOpen(true);
        addForm.setFieldsValue(editUser);
    }
    const deleteUser = (record) => {
        Modal.confirm({
            title: '是否确认删除用户？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteuser(record.id);
                    getData();
                    message.success('删除用户成功');
                } catch (error) {
                    console.error(error);
                }
            },
        });
    }
    const updateUserStatus = async (record) => {
        try {
            await updateUserstatus(record.id, { status: record.status === 0 ? 1 : 0 });
            getData();
            message.success('更新用户状态成功');
        } catch (error) {
            console.error(error);
            message.error('更新用户状态失败');
        }
    }
    const resetPassword = async (record) => {
        Modal.confirm({
            title: '是否确认重置密码？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await resetUserPassword(record.id);
                    message.success('重置密码成功');
                } catch (error) {
                    console.error(error);
                    message.error('重置密码失败');
                }
            },
        });
    }
    return (
        <>
            <Title level={4}>用户管理</Title>
            {access['sys:user:add'] ? (
                <Button type='primary' style={{ marginBottom: 16 }} onClick={showModal}>添加用户</Button>
            ) : (
                <Tooltip title="无权限" key="add-user-tooltip">
                    <Button type='primary' style={{ marginBottom: 16 }} disabled>添加用户</Button>
                </Tooltip>
            )}
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' form={searchForm} onFinish={searchUser}>
                    <Form.Item label='用户名' name='username' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='姓名' name='realName'>
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='角色' name='roleId'>
                        <Select
                            placeholder='请选择'
                            options={roleOptions}
                            // mode="multiple"
                            style={{ width: 183 }}
                        />
                    </Form.Item>
                    <Button type='primary' htmlType='submit' >查询</Button>
                    <Button style={{ marginLeft: 8 }} onClick={reset}>重置</Button>
                </Form>
            </Card>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
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
                title={editUser ? "编辑用户" : "新增用户"}
                okText="确定"
                cancelText="取消"
                open={open}
                onOk={ok}
                onCancel={cancel}
            >
                <Form form={addForm} onFinish={userOperation} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} initialValues={{ status: 1 }}>
                    <Form.Item label="用户名" name="username">
                        <Input placeholder="请输入用户名" disabled={!!editUser} />
                    </Form.Item>
                    <Form.Item label="姓名" name="realName">
                        <Input placeholder="请输入姓名" />
                    </Form.Item>
                    <Form.Item label="邮箱" name="email">
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>
                    <Form.Item label="手机号" name="phone">
                        <Input placeholder="请输入手机号" />
                    </Form.Item>
                    <Form.Item label="角色" name="roleIds">
                        <Select placeholder="请选择角色" options={roleOptions} mode="multiple">
                        </Select>
                    </Form.Item>
                    {!editUser && (
                        <Form.Item label="密码" name="password">
                            <Input.Password placeholder="请输入密码" />
                        </Form.Item>
                    )}
                    <Form.Item label="用户状态" name="status" >
                        <Radio.Group options={[
                            { label: '启用', value: 1 },
                            { label: '禁用', value: 0 }]}>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>

        </>

    )
};
export default UserManagement; 
