import OperationData from "@/components/Operation/OperationData";
import { deleteProcessingRecord, getProcessingDetail, getProcessingList, getProcessingStats } from "@/services/operation/DataProcessing";
import { formatTime } from '@/utils/timeFormat';
import { Row, Col, Typography, Input, Form, Card, Select, Button, DatePicker, Table, Space, Tag, Modal, message, Divider, Descriptions, Tooltip } from "antd";
import { useAccess } from '@umijs/max';
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const DataProcessing = () => {
    const access = useAccess();
    const columns = [
        {
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '任务ID',
            dataIndex: 'taskId',
            key: 'taskId',
            // width: 80,
        },
        {
            title: '解析ID',
            dataIndex: 'parsingId',
            key: 'parsingId',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (number: number) => {
                switch (number) {
                    case 1:
                        return <Tag color="green">已加工</Tag>;
                    case 0:
                        return <Tag color="red">失败</Tag>;
                    case 2:
                        return <Tag color="orange">加工中</Tag>;
                    default:
                        return <Tag color="red">未知</Tag>;
                }

            }
        },
        {
            title: '验证结果',
            dataIndex: 'validationResult',
            key: 'validationResult',
            render: (text: string) => {
                switch (text) {
                    case '通过':
                        return <Tag color="green">通过</Tag>;
                    case '未通过':
                        return <Tag color="red">未通过</Tag>;
                    default:
                        return <Tag color="orange">验证中</Tag>;
                }

            }
        },
        {
            title: '加工时间',
            dataIndex: 'processingTime',
            key: 'processingTime',
            render: (text: string) => {
                return formatTime(text);
            }
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 160,
            render: (text, record) => (
                <Space>
                    <Button type='link' onClick={() => showRecordDetail(record)}>查看</Button>
                    {access['rpa:data:processing:delete'] ? (
                        <Button type='link' style={{ color: '#ff0000ff' }} onClick={() => deleteRecord(record)}>删除</Button>
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
            taskId: '123456',
            parseId: '789012',
            status: 1,
            verifyResult: 1,
            processTime: '2023-08-01 10:00:00',
        },
        {
            id: 2,
            taskId: '123456',
            parseId: '789012',
            status: 0,
            verifyResult: 0,
            processTime: '2023-08-02 10:00:00',
        },
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
        searchForm.resetFields(['taskId', 'keyword', 'status', 'timeRange']);
        getData();
    }

    const getData = async () => {
        try {
            const res = await getProcessingList({ pageNum, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取数据加工列表失败:', error);
        }
    };
    useEffect(() => {
        getProcessingStatsData();
    }, []);

    useEffect(() => {
        getData();
    }, [pageNum, pageSize]);

    const search = async (values) => {
        try {
            setPageNum(1);
            const searchParams: any = {};
            if (values.taskId) {
                searchParams.taskId = values.taskId;
            }
            if (values.status !== undefined && values.status !== null) {
                searchParams.status = values.status;
            }
            if (values.keyword) {
                searchParams.keyword = values.keyword;
            }
            if (values.timeRange && values.timeRange.length === 2) {
                searchParams.startTime = values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss');
                searchParams.endTime = values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss');
            }
            const res = await getProcessingList({ pageNum: 1, pageSize, ...searchParams });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('搜索数据加工失败:', error);
        }
    }


    const deleteRecord = (record) => {
        Modal.confirm({
            title: '是否确认删除记录？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteProcessingRecord(record.id);
                    getData();
                    message.success('删除记录成功');
                } catch (error) {
                    console.error(error);
                }
            },
        });
    }

    //查看
    const [showDetail, setShowDetail] = useState(false);
    const [detailRecord, setDetailRecord] = useState({});
    const showRecordDetail = async (record) => {
        const id = record.id;
        try {
            const res = await getProcessingDetail(id);
            setDetailRecord(res.data || {});
            setShowDetail(true);
        } catch (error) {
            console.error('获取数据加工详情失败:', error);
        }
    }
    const cleanDetailRecord = () => {
        setDetailRecord({});
        setShowDetail(false);
    }

    const [processingStats, setProcessingStats] = useState([]);

    const getProcessingStatsData = async () => {
        try {
            const res = await getProcessingStats();
            setProcessingStats(res.data || []);
        } catch (error) {
            console.error('获取数据加工统计信息失败:', error);
        }
    }


    return (
        <>
            <Title level={4} style={{ marginBottom: 16 }}>数据加工</Title>
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
                <Col span={6} style={{ marginLeft: '0px' }}>
                    <OperationData cname="总加工数" cnumber={processingStats.total || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="成功" cnumber={processingStats.success || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="加工中" cnumber={processingStats.processing || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="失败" cnumber={processingStats.failed || 0} />
                </Col>
            </Row>
            {/* <RangePicker /> */}
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' style={{ gap: '8px' }} form={searchForm} onFinish={search}>
                    <Form.Item label='任务ID:' name='taskId' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='状态' name='status'>
                        <Select placeholder='请选择' options={[
                            { label: '成功', value: 0 },
                            { label: '加工中', value: 1 },
                            { label: '失败', value: 2 },
                        ]} style={{ width: 183 }} />
                    </Form.Item>
                    <Form.Item label='采集时间:' name='timeRange'>
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
                title="采集数据详情"
                cancelText="关闭"
                open={showDetail}
                onCancel={cleanDetailRecord}
                width='80%'
                footer={[
                    <Button key="close" onClick={cleanDetailRecord}>
                        关闭
                    </Button>,
                ]}
            >
                <Row justify="start" align="top"  >
                    <Col span={24} >
                        <Descriptions column={2} bordered >
                            <Descriptions.Item label="任务ID">{detailRecord.taskId || '-'}</Descriptions.Item>
                            <Descriptions.Item label="解析ID">{detailRecord.parsingId || '-'}</Descriptions.Item>
                            <Descriptions.Item label="纳税人识别号">{detailRecord.taxNo || '-'}</Descriptions.Item>
                            <Descriptions.Item label="企业名称">{detailRecord.enterpriseName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="状态">{detailRecord.status === 0 ? '成功' : detailRecord.status === 1 ? '加工中' : detailRecord.status === 2 ? '失败' : '' || '-'}</Descriptions.Item>
                            <Descriptions.Item label="加工时间">{formatTime(detailRecord.processingTime)}</Descriptions.Item>
                            <Descriptions.Item label="错误信息">{detailRecord.errorMessage || '-'}</Descriptions.Item>
                        </Descriptions>
                        <Divider style={{ borderColor: '#a5a5a5ff' }}>加工数据</Divider>
                        <Card bordered={false} style={{ backgroundColor: '#e5e5e5ff', fontSize: '12px' }} bodyStyle={{ padding: 10 }}>
                            {detailRecord.processedData || '-'}
                        </Card>
                        <Divider style={{ borderColor: '#a5a5a5ff' }}>验证结果</Divider>
                        <Card bordered={false} style={{ backgroundColor: '#e5e5e5ff', fontSize: '12px' }} bodyStyle={{ padding: 10 }}>
                            {detailRecord.validationResult || '-'}
                        </Card>
                    </Col>
                </Row>
            </Modal >
        </>
    )
};
export default DataProcessing;;
