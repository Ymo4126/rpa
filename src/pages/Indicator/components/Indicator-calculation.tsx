import { Typography, Button, Space, Table, Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { getIndicatorList, getIndicatorDetail, addIndicator, updateIndicator, deleteIndicator } from '@/services/indicator/Calculation';
import { getTaskOptions } from '@/services/indicator/DataQuery';

const { Title } = Typography;
const { TextArea } = Input;

const IndicatorCalculation = () => {
    const access = useAccess();
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '指标名称',
            dataIndex: 'indicatorName',
            key: 'indicatorName',
        },
        {
            title: '指标编码',
            dataIndex: 'indicatorCode',
            key: 'indicatorCode',
        },
        {
            title: '数据来源',
            dataIndex: 'taskId',
            key: 'taskId',
        },
        {
            title: '指标逻辑',
            dataIndex: 'indicatorLogic',
            key: 'indicatorLogic',
            ellipsis: true,
            width: 600,
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    {access['indicator:calculation:edit'] ? (
                        <Button type='link' onClick={() => handleEdit(record)}>编辑</Button>
                    ) : (
                        <Tooltip title='无权限'>
                            <Button type='link' disabled style={{ color: 'gray' }}>编辑</Button>
                        </Tooltip>
                    )}
                    {access['indicator:calculation:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => handleDelete(record)}>删除</Button>
                    ) : (
                        <Tooltip title='无权限'>
                            <Button type='link' disabled style={{ color: 'gray' }}>删除</Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        }
    ];

    const [dataSource, setDataSource] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [indicatorOptions, setIndicatorOptions] = useState<any[]>([]);
    const [form] = Form.useForm();

    const getData = async (page = pageNum, size = pageSize) => {
        try {
            const res = await getIndicatorList({ pageNum: page, pageSize: size });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取指标列表失败:', error);
        }
    };

    const getOptions = async () => {
        try {
            const res = await getTaskOptions();
            setIndicatorOptions(res.data || []);
        } catch (error) {
            console.error('获取任务选项失败:', error);
        }
    };

    useEffect(() => {
        getData();
        getOptions();
    }, [pageNum, pageSize]);

    const handleChange = (page: number, size: number) => {
        setPageNum(page);
        setPageSize(size);
    };

    const showModal = () => {
        setEditRecord(null);
        form.resetFields();
        setOpen(true);
    };

    const handleEdit = async (record: any) => {
        setEditRecord(record);
        setOpen(true);
        try {
            const res = await getIndicatorDetail(record.id);
            form.setFieldsValue(res.data);
        } catch (error) {
            console.error('获取指标详情失败:', error);
            form.setFieldsValue(record);
        }
    };

    const handleDelete = (record: any) => {
        Modal.confirm({
            title: '是否确认删除该指标？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteIndicator(record.id);
                    message.success('删除成功');
                    getData();
                } catch (error) {
                    console.error('删除失败:', error);
                }
            },
        });
    };

    const handleOk = () => {
        form.submit();
    };

    const handleCancel = () => {
        setOpen(false);
        form.resetFields();
        setEditRecord(null);
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) {
                await updateIndicator(editRecord.id, values);
                message.success('编辑成功');
            } else {
                await addIndicator(values);
                message.success('新增成功');
            }
            setOpen(false);
            form.resetFields();
            setEditRecord(null);
            getData();
        } catch (error) {
            console.error('操作失败:', error);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>指标计算</Title>
                {access['indicator:calculation:add'] ? (
                    <Button type='primary' icon={<PlusOutlined />} onClick={showModal}>新增</Button>
                ) : (
                    <Tooltip title='无权限' key='add-calculation-tooltip'>
                        <Button type='primary' disabled icon={<PlusOutlined />}>新增</Button>
                    </Tooltip>
                )}
            </div>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey='id'
                scroll={{ x: 1000 }}
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
                title={editRecord ? '编辑指标' : '新增指标'}
                okText='确定'
                cancelText='取消'
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} onFinish={handleSubmit} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
                    <Form.Item label='指标名称' name='indicatorName' rules={[{ required: true, message: '请输入指标名称' }]}>
                        <Input placeholder='请输入指标名称' />
                    </Form.Item>
                    <Form.Item label='指标编码' name='indicatorCode' rules={[{ required: true, message: '请输入指标编码' }]}>
                        <Input placeholder='请输入指标编码' />
                    </Form.Item>
                    <Form.Item label='指标逻辑' name='indicatorLogic' rules={[{ required: true, message: '请输入指标逻辑' }]}>
                        <TextArea rows={4} placeholder='请输入指标逻辑' />
                    </Form.Item>
                    <Form.Item label='数据来源' name='taskId' rules={[{ required: true, message: '请选择数据来源' }]}>
                        <Select placeholder='请选择数据来源' options={indicatorOptions.map((item: any) => ({ label: item.taskId, value: item.taskId }))} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default IndicatorCalculation;
