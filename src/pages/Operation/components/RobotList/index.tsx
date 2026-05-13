import OperationData from "@/components/Operation/OperationData";
import RobotData from "@/components/Operation/OperationData";
import { addRobot, deleteRobotData, getRobotDetail, getRobotList, getRobotStatsdata, updateRobot as updateRobotData } from "@/services/operation/RobotList";
import { formatTime } from '@/utils/timeFormat';
import { Col, Row, Card, Typography, Button, Form, Input, Select, Table, Space, Tag, Modal, Radio, message, Descriptions, Tooltip } from "antd";
import { useAccess } from '@umijs/max';
import { useEffect, useState } from "react";
const { Title } = Typography;

const RobotList = () => {
    const access = useAccess();
    const columns = [
        {
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '机器人编码',
            dataIndex: 'botCode',
            key: 'botCode',
        },
        {
            title: '机器人名称',
            dataIndex: 'botName',
            key: 'botName',
        },

        {
            title: '类型',
            dataIndex: 'botType',
            key: 'botType',
        },

        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text: number) => {
                return (text === 1 ? <Tag color="green">在线</Tag> : <Tag color="red">离线</Tag>);
            }
        }, {
            title: '当前任务ID',
            dataIndex: 'currentTaskId',
            key: 'currentTaskId',
            render: (text: string) => {
                return (text ? text : '空闲');
            }
        }, {
            title: '最后心跳',
            dataIndex: 'lastHeartbeat',
            key: 'lastHeartbeat',
            render: (text: string) => {
                return formatTime(text);
            }
        }, {
            title: '更新时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
            render: (text: string) => {
                return formatTime(text);
            }
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 240,
            render: (text, record) => (
                <Space>
                    <Button type='link' onClick={() => viewDetail(record)}>查看</Button>
                    {access['rpa:bot:edit'] ? (
                        <Button type='link' style={{ color: '#997800d4' }} onClick={() => updateRobot(record)}>编辑</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>编辑</Button>
                        </Tooltip>
                    )}
                    {access['rpa:bot:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => deleteRobot(record)}>删除</Button>
                    ) : (
                        <Tooltip title="无权限">
                            <Button type='link' style={{ color: 'gray' }} disabled>删除</Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        }
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
        searchForm.resetFields(['robotName', 'robotCode', 'status',]);
        getData();
        getRobotStatsData();
    }
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [viewRecord, setViewRecord] = useState(null);
    const showModal = () => { setOpen(true); };
    const ok = () => { addForm.submit(); };
    const [editRobot, setEditRobot] = useState(null);
    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
        setEditRobot(null);
    }
    const cancelDetail = () => {
        setDetailOpen(false);
        setViewRecord(null);
    }

    const getData = async () => {
        try {
            const res = await getRobotList({ pageNum, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取机器人列表失败:', error);
        }
    };
    useEffect(() => {
        getRobotStatsData();
    }, []);

    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);



    const robotOperation = async (values) => {

        if (!values.botCode) {
            message.error('请输入机器人编码');
            return;
        }

        if (!values.botName) {
            message.error('请输入机器人名称');
            return;
        }
        if (!values.botType) {
            message.error('请选择机器人类型');
            return;
        }
        if (!values.description) {
            message.error('请输入机器人描述');
            return;
        }

        if (values.status === undefined || values.status === null) {
            message.error('请选择机器人状态');
            return;
        }
        try {
            let res = null;
            if (editRobot) {
                const updateDate = { ...values }
                // console.log(updateDate)
                res = await updateRobotData(editRobot.id, updateDate);
            } else {
                res = await addRobot(values);
            }

            getData();
            getRobotStatsData();
            setOpen(false);
            addForm.resetFields();
            setEditRobot(null);
            message.success(editRobot ? '编辑机器人成功' : '新增机器人成功');
        } catch (error) {
            console.error('机器人操作失败:', error);
        }
    };
    const updateRobot = async (record) => {
        const id = record.id;
        try {
            const res = await getRobotDetail(id);
            setEditRobot(res.data);
            setOpen(true);
            addForm.setFieldsValue(res.data);
            console.log('编辑机器人成功');
        } catch (error) {
            console.error('获取机器人详情失败:', error);
        }


    }

    const viewDetail = async (record) => {
        const id = record.id;
        try {
            const res = await getRobotDetail(id);
            setViewRecord(res.data);
            setDetailOpen(true);
        } catch (error) {
            console.error('获取机器人详情失败:', error);
            message.error('获取机器人详情失败');
        }

    }

    const deleteRobot = (record) => {
        Modal.confirm({
            title: '是否确认删除机器人？在删除前请确认机器人未在运行中',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await deleteRobotData(record.id);
                    getData();
                    getRobotStatsData();
                    message.success('删除机器人成功');
                } catch (error) {
                    console.error(error);
                }
            },
        });
    }

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
            const res = await getRobotList(searchParams);
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
            message.success('搜索成功');
        } catch (error) {
            console.error('搜索机器人失败:', error);
        }
    }

    const [robotStatsData, setRobotStatsData] = useState([]);

    const getRobotStatsData = async () => {
        try {
            const res = await getRobotStatsdata();
            setRobotStatsData(res.data || []);
        } catch (error) {
            console.error('获取机器人统计信息失败:', error);
        }
    }


    return (
        <>
            <Title level={4} style={{ marginBottom: 16 }}>机器人列表</Title>
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
                <Col span={6} style={{ marginLeft: '0px' }}>
                    <OperationData cname="总机器人数" cnumber={robotStatsData.total || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="在线" cnumber={robotStatsData.online || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="工作中" cnumber={robotStatsData.working || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="离线" cnumber={robotStatsData.offline || 0} />
                </Col>
            </Row>
            {access['rpa:bot:add'] ? (
                <Button type='primary' style={{ marginBottom: 16 }} onClick={showModal}>添加机器人</Button>
            ) : (
                <Tooltip title="无权限" key="add-robot-tooltip">
                    <Button type='primary' style={{ marginBottom: 16 }} disabled>添加机器人</Button>
                </Tooltip>
            )}
            <Card style={{ marginBottom: 16 }} >
                <Form layout='inline' form={searchForm} onFinish={searchUser}>
                    <Form.Item label='机器人名称:' name='robotName' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='机器人编码:' name='robotCode'>
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='状态:' name='status'>
                        <Select placeholder='请选择机器人状态' options={[
                            { label: '在线', value: 1 },
                            { label: '离线', value: 0 },
                        ]} style={{ width: 183 }} />
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
                title={editRobot ? "编辑机器人信息" : "新增机器人"}
                okText="确定"
                cancelText="取消"
                open={open}
                onOk={ok}
                onCancel={cancel}
            >
                <Form form={addForm} onFinish={robotOperation} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} initialValues={{ status: 1 }}>

                    <Form.Item label="机器人编码" name="botCode">
                        <Input placeholder="请输入机器人编码" disabled={!!editRobot} />
                    </Form.Item>
                    <Form.Item label="机器人名称" name="botName">
                        <Input placeholder="请输入机器人名称" />
                    </Form.Item>
                    <Form.Item label="类型" name="botType">
                        <Input placeholder="请输入类型" />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input.TextArea placeholder="请输入描述" />
                    </Form.Item>
                    <Form.Item label="状态" name="status" >
                        <Radio.Group options={[
                            { label: '在线', value: 1 },
                            { label: '离线', value: 0 },
                        ]}>
                        </Radio.Group>
                    </Form.Item>

                </Form>
            </Modal>

            <Modal
                title="机器人详细"
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
                        <Descriptions column={2} bordered >
                            <Descriptions.Item label="机器人编码">{viewRecord?.botCode}</Descriptions.Item>
                            <Descriptions.Item label="机器人名称">{viewRecord?.botName}</Descriptions.Item>
                            <Descriptions.Item label="类型">{viewRecord?.botType}</Descriptions.Item>
                            <Descriptions.Item label="状态">{viewRecord?.status === 1 ? '在线' : '离线'}</Descriptions.Item>
                            <Descriptions.Item label="当前任务ID">{viewRecord?.currentTaskId || '空闲'}</Descriptions.Item>
                            <Descriptions.Item label="最后心跳">{formatTime(viewRecord?.lastHeartbeat)}</Descriptions.Item>
                        </Descriptions>
                        <Descriptions >
                            <Descriptions.Item label="描述">{viewRecord?.description || '无描述'}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>

            </Modal >
        </>
    )
};
export default RobotList;