import OperationData from "@/components/Operation/OperationData";
import { deleteAnalysisRecord, getAnalysisDetail, getAnalysisList, getAnalysisStats } from "@/services/operation/DataAnalysis";
import { formatTime } from '@/utils/timeFormat';
import { Row, Col, Typography, Input, Form, Card, Select, Button, DatePicker, Table, Space, Tag, Modal, message, Divider, Descriptions, Tooltip } from "antd";
import { useAccess } from '@umijs/max';
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const DataAnalysis = () => {
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
            width: 80,
        },
        {
            title: '采集ID',
            dataIndex: 'collectionId',
            key: 'collectionId',
            width: 80,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (number: number) => {
                switch (number) {
                    case 1:
                        return <Tag color="green">已解析</Tag>;
                    case 0:
                        return <Tag color="red">失败</Tag>;
                    case 2:
                        return <Tag color="orange">解析中</Tag>;
                    default:
                        return <Tag color="red">未知</Tag>;
                }

            }
        },
        {
            title: '提取字段数',
            dataIndex: 'extractedFields',
            key: 'extractedFields',
            ellipsis: true,
            width: 600,
        },
        {
            title: '解析规则',
            dataIndex: 'parsingRule',
            key: 'parsingRule',
        },
        {
            title: '解析时间',
            dataIndex: 'parsingTime',
            key: 'parsingTime',
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
                    {access['rpa:data:parsing:delete'] ? (
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
            collectionId: '789012',
            status: 1,
            extractFields: 10,
            parseRules: '规则1',
            parseTime: '2023-08-01 10:00:00',
        },
        {
            id: 2,
            taskId: '123456',
            collectionId: '789012',
            status: 0,
            extractFields: 10,
            parseRules: '规则2',
            parseTime: '2023-08-02 10:00:00',
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
            const res = await getAnalysisList({ pageNum, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取数据采集列表失败:', error);
        }
    };
    useEffect(() => {
        getAnalysisStatsData();
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
            const res = await getAnalysisList({ pageNum: 1, pageSize, ...searchParams });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('搜索数据采集失败:', error);
        }
    }


    const deleteRecord = (record) => {
        Modal.confirm({
            title: '是否确认删除记录？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteAnalysisRecord(record.id);
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
            const res = await getAnalysisDetail(id);
            setDetailRecord(res.data || {});
            setShowDetail(true);
        } catch (error) {
            console.error('获取数据采集详情失败:', error);
        }
    }
    const cleanDetailRecord = () => {
        setDetailRecord({});
        setShowDetail(false);
    }


    const [analysisStats, setAnalysisStats] = useState([]);

    const getAnalysisStatsData = async () => {
        try {
            const res = await getAnalysisStats();
            setAnalysisStats(res.data || []);
        } catch (error) {
            console.error('获取数据解析统计信息失败:', error);
        }
    }


    return (
        <>
            <Title level={4} style={{ marginBottom: 16 }}>数据解析</Title>
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
                <Col span={6} style={{ marginLeft: '0px' }}>
                    <OperationData cname="总解析数" cnumber={analysisStats.total || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="成功" cnumber={analysisStats.success || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="解析中" cnumber={analysisStats.processing || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="失败" cnumber={analysisStats.failed || 0} />
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
                            { label: '成功', value: 1 },
                            { label: '解析中', value: 2 },
                            { label: '失败', value: 0 },
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
                            <Descriptions.Item label="任务ID">{detailRecord.taskId || '-'} </Descriptions.Item>
                            <Descriptions.Item label="采集ID">{detailRecord.collectionId || '-'} </Descriptions.Item>
                            <Descriptions.Item label="纳税人识别号">{detailRecord.taxNo || '-'} </Descriptions.Item>
                            <Descriptions.Item label="状态">{detailRecord.status === 0 ? '成功' : detailRecord.status === 1 ? '解析中' : '失败'} </Descriptions.Item>
                            <Descriptions.Item label="解析时间">{formatTime(detailRecord.parsingTime)}</Descriptions.Item>
                            <Descriptions.Item label="错误信息">{detailRecord.errorMessage || '-'} </Descriptions.Item>
                        </Descriptions>
                        <Divider style={{ borderColor: '#a5a5a5ff' }}>解析数据</Divider>
                        <Card bordered={false} style={{ backgroundColor: '#e5e5e5ff', fontSize: '12px' }} bodyStyle={{ padding: 10 }}>{detailRecord.parsedData || '无'}</Card>
                    </Col>
                </Row>
            </Modal >
        </>
    )
};
export default DataAnalysis;