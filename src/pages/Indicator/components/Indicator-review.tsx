import { Typography, Button, Space, Table, Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { getIndicatorReviewList, getAuditRuleDetail, addAuditRule, updateAuditRule, deleteAuditRule } from '@/services/indicator/Review';
import { getIndicatorOptions } from '@/services/indicator/Calculation';

const { Title } = Typography;
const { TextArea } = Input;

const IndicatorReview = () => {
    const access = useAccess();
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '额度名称',
            dataIndex: 'quotaName',
            key: 'quotaName',
        },
        {
            title: '指标编码',
            dataIndex: 'indicatorCodes',
            key: 'indicatorCodes',
        },
        {
            title: '结果变量名称',
            dataIndex: 'resultVarName',
            key: 'resultVarName',
        },
        {
            title: '额度计算结果',
            dataIndex: 'calculatedResult',
            key: 'calculatedResult',
        },
        {
            title: '输出数据模板',
            dataIndex: 'outputTemplate',
            key: 'outputTemplate',
            ellipsis: true,
            width: 400,
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    {access['indicator:review:edit'] ? (
                        <Button type='link' onClick={() => handleEdit(record)}>编辑</Button>
                    ) : (
                        <Tooltip title='无权限'>
                            <Button type='link' disabled style={{ color: 'gray' }}>编辑</Button>
                        </Tooltip>
                    )}
                    {access['indicator:review:delete'] ? (
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
            const res = await getIndicatorReviewList({ pageNum: page, pageSize: size });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取指标审核列表失败:', error);
        }
    };

    const getOptions = async () => {
        try {
            const res = await getIndicatorOptions();
            setIndicatorOptions(res.data || []);
        } catch (error) {
            console.error('获取指标选项失败:', error);
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
            const res = await getAuditRuleDetail(record.id);
            const detail = res.data;
            detail.indicatorCodes = detail.indicatorCodes ? detail.indicatorCodes.split(',') : [];
            detail.conditions = detail.conditions ? detail.conditions.split('\n') : [''];
            form.setFieldsValue(detail);
        } catch (error) {
            console.error('获取审核规则详情失败:', error);
            const fallback = { ...record };
            fallback.indicatorCodes = fallback.indicatorCodes ? fallback.indicatorCodes.split(',') : [];
            fallback.conditions = fallback.conditions ? fallback.conditions.split('\n') : [''];
            form.setFieldsValue(fallback);
        }
    };

    const handleDelete = (record: any) => {
        Modal.confirm({
            title: '是否确认删除该审核规则？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteAuditRule(record.id);
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
            const submitValues = {
                ...values,
                indicatorCodes: Array.isArray(values.indicatorCodes) ? values.indicatorCodes.join(',') : values.indicatorCodes,
                conditions: Array.isArray(values.conditions) ? values.conditions.join('\n') : values.conditions,
            };
            if (editRecord) {
                await updateAuditRule(editRecord.id, submitValues);
                message.success('编辑成功');
            } else {
                await addAuditRule(submitValues);
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
                <Title level={4} style={{ margin: 0 }}>指标审核</Title>
                {access['indicator:review:add'] ? (
                    <Button type='primary' icon={<PlusOutlined />} onClick={showModal}>新增</Button>
                ) : (
                    <Tooltip title='无权限' key='add-review-tooltip'>
                        <Button type='primary' disabled icon={<PlusOutlined />}>新增</Button>
                    </Tooltip>
                )}
            </div>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey='id'
                scroll={{ x: 1200 }}
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
                title={editRecord ? '编辑审核规则' : '新增审核规则'}
                okText='确定'
                cancelText='取消'
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
            >
                <Form form={form} onFinish={handleSubmit} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
                    <Form.Item label='额度名称' name='quotaName' rules={[{ required: true, message: '请输入额度名称' }]}>
                        <Input placeholder='请输入额度名称' />
                    </Form.Item>
                    <Form.Item label='指标编码' name='indicatorCodes' rules={[{ required: true, message: '请选择指标编码' }]}>
                        <Select
                            mode='multiple'
                            placeholder='请选择指标编码'
                            options={indicatorOptions.map((item: any) => ({
                                label: `${item.indicatorCode} - ${item.indicatorName}`,
                                value: item.indicatorCode,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label='判断逻辑'>
                        <Form.List name='conditions' initialValue={['']}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                            <Form.Item {...restField} name={name} style={{ flex: 1, marginBottom: 0 }} rules={[{ required: true, message: '请输入判断逻辑' }]}>
                                                <Input placeholder='请输入判断逻辑' />
                                            </Form.Item>
                                            {fields.length > 1 && (
                                                <MinusCircleOutlined style={{ cursor: 'pointer', color: '#ff4d4f', lineHeight: '32px' }} onClick={() => remove(name)} />
                                            )}
                                        </div>
                                    ))}
                                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                        添加分支
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>
                    <Form.Item label='额度计算' name='quotaCalculation'>
                        <Input placeholder='请输入额度计算公式' />
                    </Form.Item>
                    <Form.Item label='结果变量名称' name='resultVarName' rules={[{ required: true, message: '请输入结果变量名称' }]}>
                        <Input placeholder='请输入结果变量名称' />
                    </Form.Item>
                    <Form.Item label='输出数据模板' name='outputTemplate'>
                        <TextArea rows={4} placeholder='请输入输出数据模板' />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default IndicatorReview;
