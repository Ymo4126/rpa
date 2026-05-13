import { addTaskRecord, deleteTaskRecord, executeTaskNow, getTaskDetail, getTaskList, updateTaskRecord } from '@/services/operation/TaskList';
import { getRobotOptions } from '@/services/operation/RobotList';
import { getProcessOptions } from '@/services/operation/ProcessList';
import { formatTime } from '@/utils/timeFormat';
import { DatePicker, Typography, Card, Button, Col, Row, Avatar, Space, Descriptions, Form, Input, Select, Table, TimePicker, Tag, Modal, message, Tooltip } from 'antd';
import { useAccess } from '@umijs/max';
import { useEffect, useState } from 'react';
const { Title } = Typography;
const { RangePicker } = DatePicker;



const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '访客', value: 'guest' },
];

const TaskList = () => {
    const access = useAccess();
    const columns = [
        {
            title: '序号',
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
            title: '任务名称',
            dataIndex: 'taskName',
            key: 'taskName',
        },

        {
            title: '纳税人识别号',
            dataIndex: 'taxNo',
            key: 'taxNo',
        },
        {
            title: '企业名称',
            dataIndex: 'enterpriseName',
            key: 'enterpriseName',
        },
        {
            title: '任务状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            // ：0-失败；1-已完成；2-运行中；3-待执行
            render: (text: number) => {
                switch (text) {
                    case 0:
                        return <Tag color="red">失败</Tag>;
                    case 1:
                        return <Tag color="green">已完成</Tag>;
                    case 2:
                        return <Tag color="orange">运行中</Tag>;
                    case 3:
                        return <Tag color="blue">待执行</Tag>;
                    default:
                        return <Tag color="red">未知状态</Tag>;
                }
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
                    <Button type='link' onClick={() => showTaskDetail(record)}>查看详细</Button>
                    {access['rpa:task:edit'] ? (
                        <Button type='link' style={{ color: '#997800d4' }} onClick={() => updateTaskinfo(record)}>编辑</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>编辑</Button>
                        </Tooltip>
                    )}
                    {access['rpa:task:run'] ? (
                        <Button type='link' style={{ color: '#0aff1ad0' }} onClick={() => executeTask(record)}>执行</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>执行</Button>
                        </Tooltip>
                    )}
                    {access['rpa:task:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => deleteTask(record)}>删除</Button>
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
            taskCode: 'TASK12345600',
            taskName: '任务1',
            taskType: '任务类型1',
            taxpayerId: '913022020101010101',
            companyName: '企业1',
            status: '已完成',
            createTime: '2023-01-01 12:00:00',
            startTime: '2023-01-01 12:00:00',
            endTime: '2023-01-01 12:00:00',
            processCode: 'PROCESS1',
            robotCode: 'ROBOT1',
            executeTime: 6,
        }
        ,
        {
            index: 2,
            taskCode: 'TASK12345601',
            taskName: '任务2',
            taskType: '任务类型2',
            taxpayerId: '913022020101010102',
            companyName: '企业2',
            status: '失败',
            createTime: '2023-01-01 12:00:00',
            startTime: '2023-01-01 12:00:00',
            endTime: '2023-01-01 12:00:00',
            processCode: 'PROCESS2',
            robotCode: 'ROBOT2',
            executeTime: 8,


        }
    ]
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const handleChange = (page: number, size: number) => {
        setPageNum(page);
        setPageSize(size);
    };

    // 下拉框选项状态
    const [processOptions, setProcessOptions] = useState<{ label: string; value: string }[]>([]);
    const [robotOptions, setRobotOptions] = useState<{ label: string; value: string }[]>([]);

    // 详情部分-------------------------------------------------
    // 任务详情
    const [showDetail, setShowDetail] = useState(false);
    const [detailRecord, setDetailRecord] = useState({});
    const showTaskDetail = async (record) => {
        const id = record.id;
        try {
            const res = await getTaskDetail(id);
            setShowDetail(true);
            setDetailRecord(res.data);
        } catch (error) {
            console.error('获取任务详情失败:', error);
        }
    }
    const cleanDetailRecord = () => {
        setDetailRecord({});
        setShowDetail(false);
    }

    //功能部分-------------------------------------------------
    const [dataSource, setDataSource] = useState([]);
    const [searchForm] = Form.useForm();
    const reset = () => {
        searchForm.resetFields(['keyword', 'status', 'timeRange']);
        getData();
    }
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [isExecute, setIsExecute] = useState(false);
    const showModal = () => {
        setOpen(true);
        addForm.setFieldsValue({
            processId: processOptions[0]?.value,
            botId: robotOptions[0]?.value,
            priority: 1
        });
    };
    const ok = () => { setIsExecute(false); addForm.submit(); };
    const okAndExecute = () => { setIsExecute(true); addForm.submit(); };
    const [editTask, setEditTask] = useState(null);
    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
        setEditTask(null);
    }
    const getData = async () => {
        try {
            // const res = await getUserList();
            const res = await getTaskList({ pageNum, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取任务列表失败:', error);
        }
    };

    // 加载流程下拉框数据
    const loadProcessOptions = async () => {
        try {
            const res = await getProcessOptions();
            const options = res.data?.map((item: any) => ({
                label: item.processName || item.name,
                value: String(item.id),
            })) || [];
            setProcessOptions(options);
        } catch (error) {
            console.error('加载流程选项失败:', error);
        }
    };

    // 加载机器人下拉框数据
    const loadRobotOptions = async () => {
        try {
            const res = await getRobotOptions({});
            const options = res.data?.map((item: any) => ({
                label: item.botName || item.name,
                value: String(item.id),
            })) || [];
            setRobotOptions(options);
        } catch (error) {
            console.error('加载机器人选项失败:', error);
        }
    };

    useEffect(() => {
        loadProcessOptions();
        loadRobotOptions();
    }, []);

    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);
    const searchTask = async (values) => {
        try {
            setPageNum(1);
            const searchParams: any = {};
            if (values.keyword) {
                searchParams.keyword = values.keyword;
            }
            if (values.status !== undefined && values.status !== null) {
                searchParams.status = values.status;
            }
            if (values.timeRange && values.timeRange.length === 2) {
                searchParams.startTime = values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss');
                searchParams.endTime = values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss');
            }
            const res = await getTaskList({ pageNum: 1, pageSize, ...searchParams });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
            console.log('搜索参数:', searchParams);
        } catch (error) {
            console.error('搜索任务失败:', error);
        }
    }
    const taskOperation = async (values) => {
        const executeNow = isExecute;

        if (!values.taskName) {
            message.error('请输入任务名称');
            return;
        }
        if (!values.processId) {
            message.error('请选择绑定流程');
            return;
        }
        if (!values.botId) {
            message.error('请选择绑定机器人');
            return;
        }
        if (!values.taxNo) {
            message.error('请输入纳税人识别号');
            return;
        }
        if (!values.enterpriseName) {
            message.error('请输入企业名称');
            return;
        }
        if (!values.priority) {
            message.error('请选择优先级');
            return;
        }
        try {
            let res = null;
            if (editTask) {
                // const updateDate = { ...values, id: editTask.id }
                res = await updateTaskRecord(editTask.id, values);
            } else {
                res = await addTaskRecord({ ...values, executeNow });
            }

            getData();
            setOpen(false);
            addForm.resetFields();
            setEditTask(null);
            setIsExecute(false);
            message.success(editTask ? '编辑任务成功' : '新增任务成功');
        } catch (error) {
            console.error('任务操作失败:', error);
        }
    };
    const updateTaskinfo = async (record) => {
        try {
            const res = await getTaskDetail(record.id);
            const data = res.data;
            data.processId = String(data.processId);
            data.botId = String(data.botId);
            setEditTask(data);
            setOpen(true);
            addForm.setFieldsValue(data);
        } catch (error) {
            console.error('获取任务详情失败:', error);
        }
    }
    const deleteTask = (record) => {
        Modal.confirm({
            title: '是否确认删除任务？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteTaskRecord(record.id);
                    getData();
                    message.success('删除任务成功');
                } catch (error) {
                    console.error(error);
                    message.error('删除任务失败');
                }
            },
        });
    }
    const executeTask = async (record) => {
        try {
            await executeTaskNow(record.id);
            message.success('执行任务成功');
            getData();
        } catch (error) {
            console.error(error);
            message.error('执行任务失败');
        }

    }

    return (
        <>{!showDetail ? (
            <>
                <Title level={4}>任务列表</Title>
                {access['rpa:task:add'] ? (
                    <Button type='primary' style={{ marginBottom: 16 }} onClick={showModal}>添加任务</Button>
                ) : (
                    <Tooltip title="无权限" key="add-task-tooltip">
                        <Button type='primary' style={{ marginBottom: 16 }} disabled>添加任务</Button>
                    </Tooltip>
                )}
                <a style={{ color: '#000000d4' }}>（创建任务时必须绑定：流程 + 机器人；流程版本可选）</a>
                <Card style={{ marginBottom: 16 }}>
                    <Form layout='inline' form={searchForm} onFinish={searchTask}>
                        <Form.Item label='任务编码/名称:' name='keyword' >
                            <Input placeholder='请输入' />
                        </Form.Item>
                        <Form.Item label='任务状态' name='status'>
                            <Select placeholder='请选择任务状态' options={[
                                { label: '失败', value: 0 },
                                { label: '已完成', value: 1 },
                                { label: '运行中', value: 2 },
                                { label: '待执行', value: 3 },
                            ]} style={{ width: 183 }} />
                        </Form.Item>
                        <Form.Item label='时间段' name='timeRange'>
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
                    title={editTask ? "编辑任务" : "新增任务"}
                    open={open}
                    onCancel={cancel}
                    footer={[
                        <Button key="cancel" onClick={cancel}>
                            取消
                        </Button>,
                        <Button key="ok" type="primary" onClick={ok}>
                            {editTask ? "保存" : "创建"}
                        </Button>,
                        !editTask && (
                            <Button key="execute" type="primary" style={{ marginLeft: 8, backgroundColor: '#1eb400ff' }} onClick={okAndExecute}>
                                创建并执行
                            </Button>
                        ),
                    ]}
                >
                    <Form form={addForm} onFinish={taskOperation} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
                        <Form.Item label="任务名称" name="taskName">
                            <Input placeholder="请输入任务名称" disabled={!!editTask} />
                        </Form.Item>
                        <Form.Item label="绑定流程" name="processId">
                            <Select placeholder="请选择绑定流程" options={processOptions} />
                        </Form.Item>
                        <Form.Item label="绑定机器人" name="botId">
                            <Select placeholder="请选择绑定机器人" options={robotOptions} />
                        </Form.Item>
                        <Form.Item label="纳税人识别号" name="taxNo">
                            <Input placeholder="请输入纳税人识别号" />
                        </Form.Item>
                        <Form.Item label="企业名称" name="enterpriseName">
                            <Input placeholder="请输入企业名称" />
                        </Form.Item>
                        <Form.Item label="优先级" name="priority">
                            <Input placeholder='请输入优先级' defaultValue={1} />
                        </Form.Item>
                        <Form.Item label="备注" name="remark">
                            <Input.TextArea placeholder='请输入备注' rows={3} />
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        ) : (
            <>
                <Space style={{ width: '100%', justifyContent: 'start', marginBottom: 16 }}>
                    <Button onClick={cleanDetailRecord} style={{ marginRight: 16 }}>返回</Button>
                    <Title level={4} style={{ margin: 0 }}>任务详情</Title>
                </Space>
                <Card title="基本信息" style={{ marginTop: 24 }}>
                    <Col >
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="任务编码">{detailRecord.taskCode}</Descriptions.Item>
                            <Descriptions.Item label="任务名称">{detailRecord.taskName}</Descriptions.Item>
                            <Descriptions.Item label="纳税人识别号">{detailRecord.taxNo}</Descriptions.Item>
                            <Descriptions.Item label="企业名称">{detailRecord.enterpriseName}</Descriptions.Item>
                            <Descriptions.Item label="流程编码">{detailRecord.processCode}</Descriptions.Item>
                            <Descriptions.Item label="机器人编码">{detailRecord.botId}</Descriptions.Item>
                            <Descriptions.Item label="开始时间">{formatTime(detailRecord.latestExecution?.startTime)}</Descriptions.Item>
                            <Descriptions.Item label="结束时间">{formatTime(detailRecord.latestExecution?.endTime)}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Card>

                <Card title="执行记录" style={{ marginTop: 24 }}>
                    <Col >
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="开始时间">{formatTime(detailRecord.latestExecution?.startTime)}</Descriptions.Item>
                            <Descriptions.Item label="结束时间">{formatTime(detailRecord.latestExecution?.endTime)}</Descriptions.Item>
                            <Descriptions.Item label="执行时长">{detailRecord.latestExecution.duration}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Card>

            </>
        )}
        </>
    )
};
export default TaskList;
//差执行功能
