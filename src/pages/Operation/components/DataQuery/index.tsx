import OperationData from "@/components/Operation/OperationData";
import { deleteQueryRecord, getQueryDetail, getQueryList } from "@/services/operation/DataQuery";
import { formatTime } from '@/utils/timeFormat';
import { Row, Col, Typography, Input, Form, Card, Select, Button, DatePicker, Table, Space, Tag, Modal, message, Divider, Descriptions, Tooltip } from "antd";
import { useAccess } from '@umijs/max';
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const DataQuery = () => {
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
            title: '税区ID',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (text: number) => {
                return text === null ? '-' : text;
            }
        },
        {
            title: '状态',
            dataIndex: 'dataStatus',
            key: 'dataStatus',
            render: (number: number) => {
                switch (number) {
                    case 1:
                        return <Tag color="green">可用</Tag>;
                    default:
                        return <Tag color="red">已归档</Tag>;
                }

            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
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
                    {access['rpa:data:query:delete'] ? (
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
            taxpayerId: '9134567890123456789012',
            companyName: '公司1',
            taxAreaId: '123456',
            status: 1,
            createTime: '2023-08-01 10:00:00',
        },
        {
            id: 2,
            taskId: '123456',
            taxpayerId: '9234567890123456789012',
            companyName: '公司2',
            taxAreaId: '123456',
            status: 0,
            createTime: '2023-08-02 10:00:00',
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
            const res = await getQueryList({ pageNum, pageSize });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('获取数据查询列表失败:', error);
        }
    };
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
            if (values.categoryId) {
                searchParams.categoryId = values.categoryId;
            }
            if (values.dataStatus !== undefined && values.dataStatus !== null) {
                searchParams.dataStatus = values.dataStatus;
            }
            if (values.keyword) {
                searchParams.keyword = values.keyword;
            }
            if (values.timeRange && values.timeRange.length === 2) {
                searchParams.startTime = values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss');
                searchParams.endTime = values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss');
            }
            const res = await getQueryList({ pageNum: 1, pageSize, ...searchParams });
            setDataSource(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('搜索数据查询失败:', error);
        }
    }


    const deleteRecord = async (record) => {
        Modal.confirm({
            title: '是否确认删除记录？',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteQueryRecord(record.id);
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
            const res = await getQueryDetail(id);
            setDetailRecord(res.data || {});
            setShowDetail(true);
        } catch (error) {
            console.error('获取数据查询详情失败:', error);
        }
    }
    const cleanDetailRecord = () => {
        setDetailRecord({});
        setShowDetail(false);
    }


    return (
        <>
            <Title level={4} style={{ marginBottom: 16 }}>数据查询</Title>
            <Card style={{ marginBottom: 16 }}>
                <Form layout='inline' style={{ gap: '8px' }} form={searchForm} onFinish={search}>
                    <Form.Item label='关键词:' name='keyword' >
                        <Input placeholder='纳税人识别号/企业名称' />
                    </Form.Item>
                    <Form.Item label='任务ID:' name='taskId' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='税区ID:' name='categoryId' >
                        <Input placeholder='请输入' />
                    </Form.Item>
                    <Form.Item label='数据状态:' name='dataStatus'>
                        <Select placeholder='请选择' options={[
                            { label: '可用', value: 0 },
                            { label: '已归档', value: 1 },
                        ]} style={{ width: 183 }} />
                    </Form.Item>
                    <Form.Item label='创建时间:' name='timeRange'>
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
                            <Descriptions.Item label="税区ID">{detailRecord.categoryId || '-'}</Descriptions.Item>
                            <Descriptions.Item label="纳税人识别号">{detailRecord.taxNo || '-'}</Descriptions.Item>
                            <Descriptions.Item label="企业名称">{detailRecord.enterpriseName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="数据状态"><Tag color={detailRecord.dataStatus === 1 ? 'green' : 'blue'}>{detailRecord.dataStatus === 1 ? '可用' : '已归档'}</Tag></Descriptions.Item>
                            <Descriptions.Item label="创建时间">{formatTime(detailRecord.createTime)}</Descriptions.Item>
                        </Descriptions>
                        <Divider style={{ borderColor: '#a5a5a5ff' }}>业务数据</Divider>
                        <Card bordered={false} style={{ backgroundColor: '#e5e5e5ff', fontSize: '12px' }} bodyStyle={{ padding: 10 }}>
                            {detailRecord.businessData || '-'}
                        </Card>
                    </Col>
                </Row>
            </Modal >
        </>
    )
};
export default DataQuery;;
