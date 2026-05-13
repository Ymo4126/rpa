import { addResource, deleteresource, getResourceList, updateResource, getResourceOptions } from '@/services/auth/ResourceManagement';
import { formatTime } from '@/utils/timeFormat';
import { Typography, Card, Button, Col, Row, Avatar, Space, Descriptions, Form, Input, Select, Table, Tag, message, Modal, Radio, TreeSelect, Tooltip } from 'antd';
import { useAccess } from '@umijs/max';
import { useEffect, useState } from 'react';
const { Title } = Typography;

const roleOptions = [
    { label: '菜单', value: 1 },
    { label: 'API', value: 3 },
    { label: '按钮', value: 2 },
];

const ResourceManagement = () => {
    const access = useAccess();
    const columns = [
        {
            title: '资源名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '资源编码',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '资源类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: number) => {
                let color = '';
                switch (type) {
                    case 1:
                        color = 'blue';
                        break;
                    case 2:
                        color = 'yellow';
                        break;
                    default:
                        color = 'orange';
                        break;
                }
                return <Tag color={color}>{type === 1 ? '菜单' : type === 2 ? '按钮' : 'API'}</Tag>;
            },
        },
        {
            title: '路径/URL',
            dataIndex: 'path',
            key: 'path',
        },
        {
            title: '图标',
            dataIndex: 'icon',
            key: 'icon',
        },
        {
            title: '排序',
            dataIndex: 'sort',
            key: 'sort',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text: number) => <Tag color={text === 1 ? 'green' : 'red'}>{text === 1 ? '启用' : '禁用'}</Tag>,
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 160,
            render: (text, record) => (
                <Space>
                    {access['sys:resource:edit'] ? (
                        <Button type='link' onClick={() => updateResourceInfo(record)}>编辑</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' disabled style={{ color: 'gray' }}>编辑</Button>
                        </Tooltip>
                    )}
                    {access['sys:resource:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => deleteResource(record)}>删除</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>删除</Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        }
    ]


    //功能部分-------------------------------------------------
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const handleChange = (page: number, size: number) => {
        setPageNum(page);
        setPageSize(size);
    };
    const [dataSource, setDataSource] = useState([]);
    const [parentSource, setParentSource] = useState<{ label: string; value: number }[]>([]);
    const [searchForm] = Form.useForm();
    const reset = () => {
        searchForm.resetFields(['name', 'type']);
        setPageNum(1);
        getData(1, pageSize);
    }
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const showModal = () => { setOpen(true); };
    const ok = () => { addForm.submit(); };
    const [editResourceSource, setEditResourceSource] = useState(null);
    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
        setEditResourceSource(null);
    }
    const getData = async (page = pageNum, size = pageSize) => {
        try {
            const res = await getResourceList({ pageNum: page, pageSize: size });
            setDataSource(res.data.records || res.data || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取资源列表失败:', error);
        }
    };
    const fetchParentSource = async () => {
        try {
            const res = await getResourceOptions();
            if (res.code === 200) {
                const treeData = transformToTreeData(res.data || []);
                setParentSource([{ title: '根节点', value: 0 }, ...treeData]);
                console.log(parentSource);
            }
        } catch (error) {
            console.error('获取资源列表失败:', error);
        }
    };
    const transformToTreeData = (nodes: any[]) => {
        return nodes.map(node => ({
            title: node.name,
            value: node.id,
            children: node.children ? transformToTreeData(node.children) : []
        }));
    };
    useEffect(() => {
        fetchParentSource();
    }, []);

    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);
    const searchResource = async (values) => {
        try {
            setPageNum(1);
            const searchParams = { pageNum: 1, pageSize, ...values };
            const res = await getResourceList(searchParams);
            setDataSource(res.data.records || res.data || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('搜索资源失败:', error);
        }
    }
    const deleteResource = (record) => {
        Modal.confirm({
            title: '是否确认删除资源？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteresource(record.id);
                    fetchParentSource();
                    getData();
                    message.success('删除资源成功');
                } catch (error) {
                    console.error(error);
                    message.error('删除资源失败');
                }
            },
        });
    }
    const resourceOperation = async (values) => {
        if (values.parentId === undefined || values.parentId === null) {
            message.error('请选择父级资源');
            return;
        }
        if (!values.code) {
            message.error('请输入资源编码');
            return;
        }

        if (!values.name) {
            message.error('请输入资源名称');
            return;
        }
        if (!values.type) {
            message.error('请选择资源类型');
            return;
        }
        // if (!values.path) {
        //     message.error('请输入资源路径');
        //     return;
        // }
        // if (!values.icon) {
        //     message.error('请输入资源图标');
        //     return;
        // }
        if (!values.sort) {
            message.error('请输入资源排序');
            return;
        }
        if (!values.status === undefined || values.status === null) {
            message.error('请选择资源状态');
            return;
        }
        try {
            let res = null;
            if (editResourceSource) {
                const updateDate = { ...values, id: editResourceSource.id }
                res = await updateResource(editResourceSource.id, updateDate);
            } else {
                res = await addResource(values);
            }

            fetchParentSource();
            getData();
            setOpen(false);
            addForm.resetFields();
            setEditResourceSource(null);
            message.success(editResourceSource ? '编辑资源成功' : '新增资源成功');
        } catch (error) {
            console.error('资源操作失败:', error);
        }
    };
    const updateResourceInfo = (record) => {
        const editResource = { ...record };
        if (editResource.parentId === 0 || editResource.parentId === '0') {
            editResource.parentId = 1;
        }
        setEditResourceSource(editResource);
        setOpen(true);
        addForm.setFieldsValue(editResource);
    }




    return (
        <>
            <Title level={4}>资源管理</Title>
            {access['sys:resource:add'] ? (
                <Button type='primary' style={{ marginBottom: 16 }} onClick={showModal}>添加资源</Button>
            ) : (
                <Tooltip title="无权限" key="add-resource-tooltip">
                    <Button type='primary' style={{ marginBottom: 16 }} disabled>添加资源</Button>
                </Tooltip>
            )}
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' form={searchForm} onFinish={searchResource}>
                    <Form.Item label='资源名称' name='name' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='资源类型' name='type'>
                        <Select
                            placeholder='请选择'
                            options={roleOptions}
                            style={{ width: 183 }}
                        />
                    </Form.Item>
                    <Button type='primary' htmlType='submit'>查询</Button>
                    <Button style={{ marginLeft: 8 }} onClick={reset}>重置</Button>
                </Form>
            </Card>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={dataSource => dataSource.id}
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
                title={editResourceSource ? "编辑资源" : "新增资源"}
                okText="确定"
                cancelText="取消"
                open={open}
                onOk={ok}
                onCancel={cancel}
            >
                <Form form={addForm} onFinish={resourceOperation} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} initialValues={{ status: 1 }}>
                    <Form.Item label="父级资源" name="parentId">
                        <TreeSelect
                            placeholder="请选择"
                            treeData={parentSource}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="资源编码" name="code">
                        <Input placeholder="请输入资源编码" disabled={!!editResourceSource} />
                    </Form.Item>
                    <Form.Item label="资源名称" name="name">
                        <Input placeholder="请输入资源名称" />
                    </Form.Item>
                    <Form.Item label="资源类型" name="type">
                        <Select placeholder="请选择" options={roleOptions} />
                    </Form.Item>
                    <Form.Item label="路径/URL" name="path">
                        <Input placeholder="请输入路径/URL" />
                    </Form.Item>
                    <Form.Item label="图标" name="icon">
                        <Input placeholder="请输入图标" />
                    </Form.Item>
                    <Form.Item label="排序" name="sort">
                        <Input placeholder="请输入排序" />
                    </Form.Item>
                    <Form.Item label="状态" name="status" >
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
export default ResourceManagement; 
