import ProcessCard from '@/components/Operation/ProcessCard';
import { addUser } from '@/services/auth/UserProfile';
import { addProcess, deleteProcessData, getProcessDetail, getProcessList, getProcessSteps, updateProcessData, updateProcessSteps } from '@/services/operation/ProcessList';
import { formatTime } from '@/utils/timeFormat';
import { Button, Input, Form, Card, Typography, Select, Table, Tag, Space, Modal, Radio, message, Descriptions, Col, Row, Divider, Tooltip } from 'antd';
import { useAccess } from '@umijs/max';
import { useEffect, useState } from 'react';

const { Title } = Typography;
const ProcessList = () => {
    const access = useAccess();
    const columns = [
        {
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '流程编码',
            dataIndex: 'processCode',
            key: 'processCode',
        },
        {
            title: '流程名称',
            dataIndex: 'processName',
            key: 'processName',
        },

        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '步骤数',
            dataIndex: 'stepCount',
            key: 'stepCount',
            width: 80,
        },
        {
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
            render: (text: string) => {
                return formatTime(text);
            }
        }, {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 320,
            render: (text, record) => (
                <Space>
                    <Button type='link' onClick={() => viewDetail(record)} >查看</Button>
                    {access['rpa:process:edit'] ? (
                        <Button type='link' style={{ color: '#997800d4' }} onClick={() => updateProcess(record)}>编辑</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>编辑</Button>
                        </Tooltip>
                    )}
                    {access['rpa:process:design'] ? (
                        <Button type='link' style={{ color: '#a50303d0' }} onClick={() => viewDesign(record)}>设计</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>设计</Button>
                        </Tooltip>
                    )}
                    {access['rpa:process:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => deleteProcess(record)}>删除</Button>
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
            id: 1,
            processCode: 'processCode',
            processName: 'processName',
            description: 'description',
            stepCount: 1,
            status: 1,
            createTime: '2021-01-01 00:00:00',
        },
        {
            id: 2,
            processCode: 'processCode2',
            processName: 'processName2',
            description: 'description2',
            stepCount: 2,
            status: 1,
            createTime: '2021-01-02 00:00:00',
        },
    ]


    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const handleChange = (page: number, size: number) => {
        setPageNum(page);
        setPageSize(size);
    };

    const [dataSource, setDataSource] = useState([]);
    const [searchForm] = Form.useForm();
    const reset = () => {
        searchForm.resetFields(['processName', 'processCode', 'status']);
        getData();
    }
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [designOpen, setDesignOpen] = useState(false);
    const [viewRecord, setViewRecord] = useState(null);
    const showModal = () => { setOpen(true); };
    const ok = () => { addForm.submit(); };
    const [editProcess, setEditProcess] = useState(null);
    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
        setEditProcess(null);
    }

    const getData = async () => {
        try {
            const res = await getProcessList({ pageNum: pageNum, pageSize: pageSize });
            // setDataSource(res.data.records || []);
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取流程列表失败:', error);
        }
    };
    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);

    const searchUser = async (values) => {
        try {
            const searchParams = {
                pageNum: 1,
                pageSize: pageSize,
                ...values,
                processName: values.processName,
                processCode: values.processCode,
                status: values.status,
            };
            const res = await getProcessList(searchParams);
            setTotal(res.data.total || 0);
            setDataSource(res.data.records || []);
            setPageNum(res.data.pageNum || 1);
            message.success('搜索成功');
        } catch (error) {
            console.error('搜索用户失败:', error);
        }
    }
    const processOperation = async (values) => {

        if (!values.processName) {
            message.error('请输入流程名称');
            return;
        }
        if (!values.processCode) {
            message.error('请输入流程编码');
            return;
        }
        if (!values.description) {
            message.error('请输入描述');
            return;
        }


        if (values.status === undefined || values.status === null) {
            message.error('请选择流程状态');
            return;
        }

        try {
            let res = null;

            if (editProcess) {
                res = await updateProcessData(editProcess.id, values);
            } else {
                res = await addProcess(values);
            }

            getData();
            setOpen(false);
            addForm.resetFields();
            setEditProcess(null);
            message.success(editProcess ? '编辑流程成功' : '新增流程成功');
        } catch (error) {
            console.error('流程操作失败:', error);
        }
    };
    const updateProcess = (record) => {
        const editProcess = { ...record }
        setEditProcess(editProcess);
        setOpen(true);
        addForm.setFieldsValue(editProcess);
    }

    const viewDetail = async (record) => {
        const id = record.id;
        try {
            const res = await getProcessDetail(id);
            setViewRecord(res.data);
            setDetailOpen(true);
        } catch (error) {
            console.error('获取流程详情失败:', error);
            message.error('获取流程详情失败');
        }

    }
    const cancelDetail = () => {
        setDetailOpen(false);
        setViewRecord(null);
    }
    const viewDesign = async (record) => {
        setRecordId(record.id);
        const id = record.id;
        try {
            const res = await getProcessSteps(id);
            setProcessData(res.data || []);
            setDesignOpen(true);
        } catch (error) {
            console.error('获取流程步骤失败:', error);
            message.error('获取流程步骤失败');
        }
    }
    const cancelDesign = () => {
        setDesignOpen(false);
        setProcessData([]);
    }

    const [recordId, setRecordId] = useState(null);
    const handleStepUpdate = (stepId: number, stepData: { stepName: string; scriptType: string; scriptContent: string }) => {
        const updatedProcessData = processData.map(item => {
            if (item.id === stepId) {
                return { ...item, ...stepData };
            }
            return item;
        });
        setProcessData(updatedProcessData);
    }

    const saveDesign = async () => {
        const completeData = {
            processId: recordId,
            steps: processData
        };

        try {
            await updateProcessSteps(recordId, completeData);
            message.success('流程设计保存成功');
        } catch (error) {
            console.error(error);
            message.error('保存流程设计失败');
            return;
        }
        cancelDesign();
    }

    const deleteProcess = (record) => {
        Modal.confirm({
            title: '是否确认删除流程？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteProcessData(record.id);
                    getData();
                    message.success('删除流程成功');
                } catch (error) {
                    console.error(error);
                    message.error('删除流程失败');
                }
            },
        });
    }

    const [processData, setProcessData] = useState([
        // {
        //     id: 1,
        //     cname: '采集',
        //     type: 'JAVASCRIPT',
        //     code: 'PROCESS_001',
        // },
        // {
        //     id: 2,
        //     cname: '解析',
        //     type: 'JAVASCRIPT',
        //     code: 'PROCESS_002',
        // },
        // {
        //     id: 3,
        //     cname: '加工',
        //     type: 'JAVASCRIPT',
        //     code: 'PROCESS_003',
        // },
        // {
        //     id: 4,
        //     cname: '落库',
        //     type: 'JAVASCRIPT',
        //     code: 'PROCESS_004',
        // }
    ]);

    const addStep = () => {
        // setProcessData([...processData, {
        //     id: processData.length + 1,
        //     cname: '步骤 ' + (processData.length + 1),
        //     type: 'JAVASCRIPT',
        //     code: '未填写代码',
        // }]);
    }
    const deleteStep = (index) => {
        setProcessData(processData.filter((item, i) => i !== index));
    }



    return (
        <>
            <Title level={4}>流程列表</Title>
            {access['rpa:process:add'] ? (
                <Button type='primary' style={{ marginBottom: 16 }} onClick={showModal}>添加流程</Button>
            ) : (
                <Tooltip title="无权限" key="add-process-tooltip">
                    <Button type='primary' style={{ marginBottom: 16 }} disabled>添加流程</Button>
                </Tooltip>
            )}
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' form={searchForm} onFinish={searchUser}>
                    <Form.Item label='流程名称' name='processName' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='流程编码' name='processCode'>
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='状态' name='status' style={{ width: 183 }}>
                        <Select placeholder='请选择'  >
                            <Select.Option value={1}>启用</Select.Option>
                            <Select.Option value={2}>禁用</Select.Option>
                        </Select>
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
                title={editProcess ? "编辑流程" : "新增流程"}
                okText="确定"
                cancelText="取消"
                open={open}
                onOk={ok}
                onCancel={cancel}
            >
                <Form form={addForm} onFinish={processOperation} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} initialValues={{ status: 1 }}>
                    <Form.Item label="流程编码" name="processCode" >
                        <Input placeholder="如 PROCESS_001" disabled={!!editProcess} />
                    </Form.Item>
                    <Form.Item label="流程名称" name="processName">
                        <Input placeholder="如 税务发票采集流程" />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input placeholder="请输入描述" />
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
                title="流程详细"
                cancelText="关闭"
                open={detailOpen}
                onCancel={cancelDetail}
                width='80%'
                footer={[
                    <Button key="close" onClick={cancelDetail}>
                        关闭
                    </Button>,
                ]}
            >
                <Row justify="start" align="top"  >
                    <Col span={24} >
                        <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="流程编码">{viewRecord?.processCode}</Descriptions.Item>
                            <Descriptions.Item label="流程名称">{viewRecord?.processName}</Descriptions.Item>
                            <Descriptions.Item label="步骤数">{viewRecord?.stepCount}</Descriptions.Item>
                            <Descriptions.Item label="状态">{viewRecord?.status === 1 ? '启用' : '禁用'}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{formatTime(viewRecord?.createTime)}</Descriptions.Item>
                        </Descriptions>
                        <Descriptions >
                            <Descriptions.Item label="描述">{viewRecord?.description || '无描述'}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>

            </Modal >

            <Modal
                title="流程设计"
                cancelText="关闭"
                okText="保存"
                open={designOpen}
                onCancel={cancelDesign}
                onOk={saveDesign}
                width='80%'
            >
                <Button type='primary' htmlType='submit' size='small' onClick={() => addStep()}>添加步骤</Button>
                <Button htmlType='submit' size='small' style={{ marginLeft: 8 }} onClick={saveDesign}>保存设计</Button>
                <Divider size="small" />
                <Card style={{ marginBottom: 16 }}>
                    <Row justify="start" align="top" gutter={[16, 16]} >
                        {processData.map((item: any, index: number) => {
                            return (
                                <Col span={24} key={item.id}>
                                    <ProcessCard
                                        {...item}
                                        onUpdate={handleStepUpdate}
                                        onDelete={() => deleteStep(index)}
                                    />
                                </Col>
                            )
                        })}
                    </Row>
                </Card>
            </Modal >

        </>
    )
};
export default ProcessList;