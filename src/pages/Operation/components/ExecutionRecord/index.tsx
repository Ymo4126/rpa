import { getTaskLogDetail, getTaskLogList } from '@/services/operation/ExecutionRecord';
import { formatTime } from '@/utils/timeFormat';
import { DatePicker, Typography, Card, Button, Col, Row, Avatar, Space, Descriptions, Form, Input, Select, Table, TimePicker, Tag, Modal, ConfigProvider, Divider, Steps } from 'antd';
import { useEffect, useState } from 'react';
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const ExecutionRecord = () => {
    const columns = [
        {
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '执行ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '任务编码',
            dataIndex: 'taskCode',
            key: 'taskCode',

        },
        {
            title: '流程编码',
            dataIndex: 'processCode',
            key: 'processCode',
        },
        {
            title: '机器人编码',
            dataIndex: 'botCode',
            key: 'botCode',
        },
        {
            title: '执行状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            //：0-失败；1-成功；2-运行中
            render: (text, record) => {
                switch (text) {
                    case 0:
                        return <Tag color='red'>失败</Tag>;
                    case 1:
                        return <Tag color='green'>成功</Tag>;
                    case 2:
                        return <Tag color='orange'>运行中</Tag>;
                    default:
                        return <Tag color='orange'>未知</Tag>;
                }
            },
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text: string) => {
                return formatTime(text);
            }
        },
        {
            title: '结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text: string) => {
                return formatTime(text);
            }
        },
        {
            title: '执行时长',
            dataIndex: 'duration',
            key: 'duration',
            width: 120,
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 120,
            render: (text, record) => (

                <Button type='link' onClick={() => viewDetail(record)}>查看详细</Button>

            ),
        }
    ]

    const data = [
        {
            index: 1,
            executionId: 'EXEC12345600',
            taskId: 'TASK12345600',
            taskType: '任务类型1',
            processCode: 'PROCESS1',
            robotCode: 'ROBOT1',
            status: 0,
            startTime: '2023-01-01 12:00:00',
            endTime: '2023-01-01 12:00:00',
            executionTime: 6,
        }
        ,
        {
            index: 2,
            executionId: 'EXEC12345601',
            taskId: 'TASK12345601',
            taskType: '任务类型2',
            processCode: 'PROCESS2',
            robotCode: 'ROBOT2',
            status: 1,
            startTime: '2023-01-01 12:00:00',
            endTime: '2023-01-01 12:00:00',
            executionTime: 10,
        }
    ]


    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const handleChange = (page: number, size: number) => {
        setPageNum(page);
        setPageSize(size);
    };
    //功能----------------------------
    const [dataSource, setDataSource] = useState([]);
    const [searchForm] = Form.useForm();
    const reset = () => {
        searchForm.resetFields(['taskId', 'status', 'executionTimeRange']);
        getData();
    }
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [detailTask, setDetailTask] = useState(null);

    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
        setDetailTask(null);
    }
    const getData = async () => {
        try {
            const res = await getTaskLogList({ pageNum, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取任务列表失败:', error);
        }
    };
    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);
    const searchTaskRecord = async (values) => {
        try {
            setPageNum(1);
            const searchParams: any = {};
            if (values.taskId) {
                searchParams.taskId = values.taskId;
            }
            if (values.status !== undefined && values.status !== null) {
                searchParams.status = values.status;
            }
            if (values.executionTimeRange && values.executionTimeRange.length === 2) {
                searchParams.startTime = values.executionTimeRange[0].format('YYYY-MM-DDTHH:mm:ss');
                searchParams.endTime = values.executionTimeRange[1].format('YYYY-MM-DDTHH:mm:ss');
            }
            const res = await getTaskLogList({ pageNum: 1, pageSize, ...searchParams });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('搜索任务失败:', error);
        }
    }

    const localStepsTheme = {
        components: {
            Steps: {
                iconSize: 50,
                titleLineHeight: 40,
                colorPrimary: '#27d64aff',

            },
        },
    };

    const viewDetail = async (record) => {
        try {
            const res = await getTaskLogDetail(record.id);
            setDetailTask(res.data || {});
            setOpen(true);
        } catch (error) {
            console.error('获取任务详细失败:', error);
        }
    };

    return (
        <>
            <Title level={4}>执行记录</Title>
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' form={searchForm} onFinish={searchTaskRecord}>
                    <Form.Item label='任务ID:' name='taskId' >
                        <Input placeholder='请输入任务ID' />
                    </Form.Item>
                    <Form.Item label='任务状态' name='status'>
                        <Select placeholder='请选择任务状态' options={[
                            { label: '执行中', value: 0 },
                            { label: '成功', value: 1 },
                            { label: '失败', value: 2 },
                        ]} style={{ width: 183 }} />
                    </Form.Item>
                    <Form.Item label='执行时间' name='executionTimeRange'>
                        <RangePicker showTime />
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
                title="执行记录详细"
                cancelText="关闭"
                open={open}
                onCancel={cancel}
                width='80%'
                footer={[
                    <Button key="close" onClick={cancel}>
                        关闭
                    </Button>,
                ]}
            >
                <Row justify="start" align="top"  >

                    <Col span={24} >
                        <Descriptions column={2} bordered >
                            <Descriptions.Item label="执行ID">{detailTask?.id || '-'}</Descriptions.Item>
                            <Descriptions.Item label="任务编码">{detailTask?.taskCode || '-'}</Descriptions.Item>
                            <Descriptions.Item label="流程编码">{detailTask?.processCode || '-'}</Descriptions.Item>
                            <Descriptions.Item label="机器人编码">{detailTask?.botCode || '-'}</Descriptions.Item>
                            <Descriptions.Item label="执行状态">{detailTask?.status === 0 ? '失败' : detailTask?.status === 1 ? '成功' : '执行中'}</Descriptions.Item>
                            <Descriptions.Item label="执行时长">{detailTask?.duration || '-'}</Descriptions.Item>
                            <Descriptions.Item label="开始时间">{formatTime(detailTask?.startTime)}</Descriptions.Item>
                            <Descriptions.Item label="结束时间">{formatTime(detailTask?.endTime)}</Descriptions.Item>
                        </Descriptions>
                        <Divider style={{ borderColor: '#a5a5a5ff' }}>执行步骤</Divider>
                        <ConfigProvider theme={localStepsTheme}>
                            <Steps style={{ marginLeft: ' 20px' }}
                                progressDot
                                current={detailTask?.steps?.length || 0}
                                direction="vertical"
                                items={(detailTask?.steps || []).map((step: any, index: number) => ({
                                    title: (
                                        <div>
                                            <Space style={{ marginLeft: 10 }}>
                                                <Text>{step.stepName}</Text>
                                            </Space>
                                            <div style={{ marginLeft: 10 }}>
                                                {step.errorMessage ? (
                                                    <>
                                                        <Paragraph style={{ fontSize: '12px', color: 'red', marginBottom: 0 }}>
                                                            错误: {step.errorMessage}
                                                        </Paragraph>
                                                        {step.createTime && (
                                                            <Paragraph style={{ fontSize: '12px', color: '#999', marginBottom: 0 }}>
                                                                {formatTime(step.createTime)}
                                                            </Paragraph>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {step.outputData && (
                                                            <Paragraph style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                                                                输出: {step.outputData}
                                                            </Paragraph>
                                                        )}
                                                        {step.createTime && (
                                                            <Paragraph style={{ fontSize: '12px', color: '#999', marginBottom: 0 }}>
                                                                {formatTime(step.createTime)}
                                                            </Paragraph>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                    status: step.errorMessage ? 'error' : step.status === 1 ? 'finish' : step.status === 0 ? 'error' : 'process'
                                }))}
                            />
                        </ConfigProvider>
                    </Col>
                </Row>

            </Modal >
        </>
    )
};
export default ExecutionRecord;