import OperationData from "@/components/Operation/OperationData";
import { addCollectionRecord, deleteCollectionRecord, getCollectionDetail, getCollectionList, getCollectionStats } from "@/services/operation/DataCollection";
import { formatTime } from '@/utils/timeFormat';
import { Row, Col, Typography, Input, Form, Card, Select, Button, DatePicker, Table, Space, Tag, Modal, message, Divider, Descriptions, Tooltip } from "antd";
import { useAccess } from '@umijs/max';
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const DataCollection = () => {
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
            title: '任务状态',
            dataIndex: 'status',
            key: 'status',
            render: (number: number) => {
                switch (number) {
                    case 1:
                        return <Tag color="green">已采集</Tag>;
                    case 2:
                        return <Tag color="orange">解析中</Tag>;
                    case 3:
                        return <Tag color="blue">已解析</Tag>;
                    default:
                        return <Tag color="orange">采集失败</Tag>;
                }

            }
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
            title: '数据来源',
            dataIndex: 'dataSource',
            key: 'dataSource',
        },
        {
            title: '采集时间',
            dataIndex: 'collectionTime',
            key: 'collectionTime',
            render: (text: string) => {
                return formatTime(text);
            }
        }, {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 160,
            render: (text, record) => (
                <Space>
                    <Button type='link' onClick={() => showRecordDetail(record)}>查看</Button>
                    {access['rpa:data:collection:delete'] ? (
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
            id: '1',
            taskId: '2022010100000001',
            status: 1,
            taxpayerId: '91110101MA1A1A1A1A',
            companyName: '上海XXXX有限公司',
            dataSources: 'XXXX',
            collectionTime: '2022-01-01 10:00:00',
            originalData: '{"source":"study-spider-demo","site":"http://study.zmyfrank.com:18010/spider/home#","enterpriseName":"重庆某某科技有限公司","taxNo":"91500000MA5U123456","uscCode":"91500000MA5U123456","appDate":"2026-03-24","invoiceStartDate":"2025-03-01","invoiceEndDate":"2026-03-24","totalSaleAmountText":"1,271,593.70","totalPurchaseAmountText":"456,789.01","invoices":[{"invoiceCode":"1500012340","invoiceNumber":"12345678","sign":"销项","state":"正常","invoiceTime":"2024-01-15 10:30:00","jshjText":"123,456.79"},{"invoiceCode":"1500012341","invoiceNumber":"12345679","sign":"销项","state":"正常","invoiceTime":"2024-02-20 14:20:00","jshjText":"234,567.89"},{"invoiceCode":"1500012342","invoiceNumber":"12345680","sign":"销项","state":"正常","invoiceTime":"2024-03-10 09:15:00","jshjText":"345,678.90"},{"invoiceCode":"1500012343","invoiceNumber":"12345681","sign":"进项","state":"正常","invoiceTime":"2024-01-25 16:45:00","jshjText":"456,789.01"},{"invoiceCode":"1500012344","invoiceNumber":"12345682","sign":"销项","state":"异常","invoiceTime":"2024-04-05 11:00:00","jshjText":"567,890.12"}]}',
            errorMessage: '错误信息',
        },
        {
            id: '2',
            taskId: '2022010100000002',
            status: 0,
            taxpayerId: '91110101MA1A1A1A1A',
            companyName: '上海XXXX有限公司',
            dataSources: 'XXXX',
            collectionTime: '2022-01-01 10:00:00',
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
    const [addForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const showModal = () => { setOpen(true); };
    const ok = () => { addForm.submit(); };
    const cancel = () => {
        setOpen(false);
        addForm.resetFields();
    }
    const getData = async () => {
        try {
            const res = await getCollectionList({ pageNum, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取数据采集列表失败:', error);
        }
    };
    useEffect(() => {
        getCollectionStatsData();
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
            const res = await getCollectionList({ ...searchParams, pageNum: 1, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('搜索数据采集失败:', error);
        }
    }

    const addRecord = async (values) => {

        if (!values.taskId) {
            message.error('请输入任务ID');
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
        if (!values.dataSource) {
            message.error('请输入数据来源');
            return;
        }
        if (!values.status) {
            message.error('请选择任务状态');
            return;
        }

        if (!values.rawData) {
            message.error('请输入原始数据');
            return;
        }
        if (!values.errorMessage) {
            message.error('请输入错误信息');
            return;
        }

        try {
            await addCollectionRecord(values);
            getData();
            setOpen(false);
            addForm.resetFields();
            message.success('新增数据采集记录成功');
        } catch (error) {
            console.error('操作失败:', error);
        }
    };

    const deleteRecord = (record) => {
        Modal.confirm({
            title: '是否确认删除记录？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteCollectionRecord(record.id);
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
            const res = await getCollectionDetail(id);
            setDetailRecord(res.data || {});
            setShowDetail(true);
        } catch (error) {
            console.error('获取数据采集记录详情失败:', error);
        }
    }
    const cleanDetailRecord = () => {
        setDetailRecord({});
        setShowDetail(false);
    }

    const [collectionStats, setCollectionStats] = useState([]);

    const getCollectionStatsData = async () => {
        try {
            const res = await getCollectionStats();
            setCollectionStats(res.data || []);
        } catch (error) {
            console.error('获取机器人统计信息失败:', error);
        }
    }


    return (
        <>
            <Title level={4} style={{ marginBottom: 16 }}>数据采集</Title>
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
                <Col span={6} style={{ marginLeft: '0px' }}>
                    <OperationData cname="总采集数" cnumber={collectionStats.total || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="成功" cnumber={collectionStats.success || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="采集中" cnumber={collectionStats.processing || 0} />
                </Col>
                <Col span={6}>
                    <OperationData cname="失败" cnumber={collectionStats.failed || 0} />
                </Col>
            </Row>
            {/* <RangePicker /> */}
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' style={{ gap: '8px' }} form={searchForm} onFinish={search}>
                    <Form.Item label='任务ID:' name='taskId' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='关键字:' name='keyword' >
                        <Input placeholder='纳税人识别号/企业名称' />
                    </Form.Item>
                    <Form.Item label='状态' name='status'>
                        <Select placeholder='请选择' options={[
                            { label: '已采集', value: 1 },
                            { label: '解析中', value: 2 },
                            { label: '已解析', value: 3 },
                            { label: '失败', value: 4 },
                        ]} style={{ width: 183 }} />
                    </Form.Item>
                    <Form.Item label='采集时间:' name='timeRange'>
                        <RangePicker showTime />
                    </Form.Item>
                    <Button type='primary' htmlType='submit'>查询</Button>
                    <Button style={{ marginLeft: 8 }} onClick={reset}>重置</Button>
                    {access['rpa:data:collection:add'] ? (
                        <Button style={{ marginLeft: 8, backgroundColor: '#6ecf58ff' }} type='primary' onClick={showModal}>新增</Button>
                    ) : (
                        <Tooltip title="无权限" key="add-collection-tooltip">
                            <Button style={{ marginLeft: 8, backgroundColor: '#6ecf58ff' }} type='primary' disabled>新增</Button>
                        </Tooltip>
                    )}
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
                title="新增采集记录"
                okText="确定"
                cancelText="取消"
                open={open}
                onOk={ok}
                onCancel={cancel}
            >
                <Form form={addForm} onFinish={addRecord} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
                    <Form.Item label="任务ID" name="taskId">
                        <Input placeholder="请输入任务ID" />
                    </Form.Item>
                    <Form.Item label="纳税人识别号" name="taxNo">
                        <Input placeholder="请输入纳税人识别号" />
                    </Form.Item>
                    <Form.Item label="企业名称" name="enterpriseName">
                        <Input placeholder="请输入企业名称" />
                    </Form.Item>
                    <Form.Item label="数据来源" name="dataSource">
                        <Input placeholder="请输入数据来源" />
                    </Form.Item>
                    <Form.Item label="状态" name="status" >
                        <Select placeholder="请选择" options={[
                            { label: '已采集', value: 0 },
                            { label: '解析中', value: 1 },
                            { label: '已解析', value: 2 },
                            { label: '失败', value: 3 },
                        ]} />
                    </Form.Item>
                    <Form.Item label="原始数据" name="rawData">
                        <TextArea rows={3} placeholder="请输入原始数据(JSON格式)" />
                    </Form.Item>
                    <Form.Item label="错误信息" name="errorMessage">
                        <TextArea rows={2} placeholder="请输入错误信息" />
                    </Form.Item>

                </Form>
            </Modal>


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
                            <Descriptions.Item label="任务ID">{detailRecord.taskId}</Descriptions.Item>
                            <Descriptions.Item label="纳税人识别号">{detailRecord.taxNo}</Descriptions.Item>
                            <Descriptions.Item label="企业名称">{detailRecord.enterpriseName}</Descriptions.Item>
                            <Descriptions.Item label="状态">{detailRecord.status === 0 ? '已采集' : detailRecord.status === 1 ? '解析中' : detailRecord.status === 2 ? '已解析' : '失败'}</Descriptions.Item>
                            <Descriptions.Item label="数据来源">{detailRecord.dataSource}</Descriptions.Item>
                            <Descriptions.Item label="采集时间">{formatTime(detailRecord.collectionTime)}</Descriptions.Item>
                            <Descriptions.Item label="错误信息">{detailRecord.errorMessage || '无'}</Descriptions.Item>
                        </Descriptions>
                        <Divider style={{ borderColor: '#a5a5a5ff' }}>原始数据</Divider>
                        <Card bordered={false} style={{ backgroundColor: '#e5e5e5ff', fontSize: '12px' }} bodyStyle={{ padding: 10 }}>{detailRecord.rawData}</Card>
                    </Col>
                </Row>
            </Modal >
        </>
    )
};
export default DataCollection;