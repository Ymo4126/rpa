import Guide from '@/components/Guide';
import DataMini from '@/components/Home/DataMini';
import Welcome from '@/components/Home/Welcome';
import { Card, Col, Form, Input, Row, Space, Table, Typography, Tag, Descriptions } from 'antd';
import taskIcon from '@/assets/icon/任务.png';
import processIcon from '@/assets/icon/流程.png';
import robotIcon from '@/assets/icon/机器人.png';
import dataIcon from '@/assets/icon/data.png';
import TaskMini from '@/components/Home/TaskMini';
import taskCreateIcon from '@/assets/icon/创建任务.png';
import processListIcon from '@/assets/icon/机器人列表.png';
import robotQueryIcon from '@/assets/icon/数据查询.png';
import dataSettingIcon from '@/assets/icon/设置1.png';
import FastButton from '@/components/Home/FastButton';
import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentTasks, getSystemInfo } from '@/services/home/dashboard';
import { useNavigate } from '@umijs/max';
const { Title, Text } = Typography;
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const columns = [
    {
      title: '任务编码',
      dataIndex: 'taskCode',
      key: 'taskCode',
      render: (text) => <a style={{ color: '#1890ff' }}>{text}</a>,
    },
    {
      title: '流程名称',
      dataIndex: 'processName',
      key: 'processName',
    },
    {
      title: '股票名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const statusMap: any = {
          0: { label: '运行中', color: 'blue' },
          1: { label: '已完成', color: 'green' },
          2: { label: '失败', color: 'red' },
          3: { label: '待执行', color: 'default' }
        };
        const statusInfo = statusMap[status] || { label: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    }
  ]
  const data = [
    {
      key: '1',
      taskCode: 'TASK_20260318_001',
      processName: '财务数据汇总',
      stockName: '贵州茅台',
      status: '运行中',
      createTime: '2026-03-18 09:00:00',
    },
    {
      key: '2',
      taskCode: 'TASK_20260318_002',
      processName: '市场分析报告',
      stockName: '宁德时代',
      status: '已完成',
      createTime: '2026-03-18 10:30:00',
    },
    {
      key: '3',
      taskCode: 'TASK_20260318_003',
      processName: '交易数据同步',
      stockName: '腾讯控股',
      status: '待执行',
      createTime: '2026-03-18 11:15:00',
    },
    {
      key: '4',
      taskCode: 'TASK_20260318_004',
      processName: '财务数据汇总',
      stockName: '阿里巴巴',
      status: '已完成',
      createTime: '2026-03-18 13:45:00',
    },
    {
      key: '5',
      taskCode: 'TASK_20260318_005',
      processName: '风险评估',
      stockName: '比亚迪',
      status: '失败',
      createTime: '2026-03-18 15:20:00',
    },
  ];


  useEffect(() => {
    getDashboardStatsData();
    getRecentTasksData();
    getSystemInfoData();
  }, []);


  const [dashboardStatsData, setDashboardStatsData] = useState([]);
  const getDashboardStatsData = async () => {
    try {
      const res = await getDashboardStats();
      setDashboardStatsData(res.data || []);
    } catch (error) {
      console.error('获取仪表盘统计失败:', error);
    }
  };

  const [recentTasksData, setRecentTasksData] = useState([]);
  const getRecentTasksData = async () => {
    try {
      const res = await getRecentTasks({});
      setRecentTasksData(res.data || []);
    } catch (error) {
      console.error('获取最近任务失败:', error);
    }
  };


  const [systemInfoData, setSystemInfoData] = useState([]);
  const getSystemInfoData = async () => {
    try {
      const res = await getSystemInfo();
      setSystemInfoData(res.data || []);
    } catch (error) {
      console.error('获取系统信息失败:', error);
    }
  };
  return (
    <div style={{ padding: '40px 40px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Welcome />
        <Row gutter={[20, 20]}>
          <Col lg={6} xs={12}>
            <DataMini img={taskIcon} cname="总任务数" mainNumber={dashboardStatsData?.task?.total || 0} otherNumber={dashboardStatsData?.task?.todayAdded || 0} str="今日新增" onClick={() => navigate('/rpa/task-list')} />
          </Col>
          <Col lg={6} xs={12}>
            <DataMini img={robotIcon} cname="机器人总数" mainNumber={dashboardStatsData?.bot?.total || 0} otherNumber={dashboardStatsData?.bot?.online || 0} str="在线" onClick={() => navigate('/rpa/robot-list')} />
          </Col>
          <Col lg={6} xs={12}>
            <DataMini img={processIcon} cname="流程总数" mainNumber={dashboardStatsData?.process?.total || 0} otherNumber={dashboardStatsData?.process?.enabled || 0} str="启用" onClick={() => navigate('/rpa/process-definition')} />
          </Col>
          <Col lg={6} xs={12}>
            <DataMini img={dataIcon} cname="数据总量" mainNumber={dashboardStatsData?.data?.total || 0} otherNumber={dashboardStatsData?.data?.todayCollected || 0} str="今日采集" onClick={() => navigate('/rpa/data-collection')} />
          </Col>
        </Row>
        <Row gutter={[20, 20]}>
          <Col lg={16} xs={24}>
            <Card title="任务状态概况" style={{ marginBottom: '20px', cursor: 'pointer' }} extra={
              <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate('/rpa/task-list');
              }}>查看详情 {'>'}</a>
            }>
              <Row gutter={[20, 20]}>
                <Col span={6} style={{ marginLeft: '0px' }}>
                  <TaskMini cname="运行中" mainNumber={dashboardStatsData?.task?.overview?.running || 0} />
                </Col>
                <Col span={6}>
                  <TaskMini cname="待执行" mainNumber={dashboardStatsData?.task?.overview?.pending || 0} />
                </Col>
                <Col span={6}>
                  <TaskMini cname="已完成" mainNumber={dashboardStatsData?.task?.overview?.completed || 0} />
                </Col>
                <Col span={6}>
                  <TaskMini cname="失败" mainNumber={dashboardStatsData?.task?.overview?.failed || 0} />
                </Col>
              </Row>
            </Card>
            <Card title="最近任务" style={{ marginBottom: '20px', cursor: 'pointer' }} extra={
              <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate('/rpa/task-list');
              }}>查看全部 {'>'}</a>
            }>
              <Table columns={columns} dataSource={recentTasksData} pagination={false} />
            </Card>
          </Col>
          <Col lg={8} xs={24}>
            <Card title="快捷入口" style={{ marginBottom: '20px' }}>
              <Row justify="start" align="top" gutter={[10, 10]}>
                <Col span={24} style={{ marginLeft: '0px' }}>
                  <FastButton img={taskCreateIcon} cname="创建任务" str="快速创建新的RPA任务" onClick={() => navigate('/rpa/task-list')} />
                </Col>
                <Col span={24}>
                  <FastButton img={processListIcon} cname="流程定义" str="快速创建新的RPA任务" onClick={() => navigate('/rpa/process-definition')} />
                </Col>
                <Col span={24}>
                  <FastButton img={robotQueryIcon} cname="机器人列表" str="查看和管理机器人" onClick={() => navigate('/rpa/robot-list')} />
                </Col>
                <Col span={24}>
                  <FastButton img={dataSettingIcon} cname="数据查询" str="查询已处理的数据" onClick={() => navigate('/rpa/data-query')} />
                </Col>
              </Row>
            </Card>
            <Card title="系统信息" >
              <Descriptions column={1} bordered >
                <Descriptions.Item label="系统版本" style={{ height: '14px', lineHeight: '14px' }}>{systemInfoData?.version || '未知'}</Descriptions.Item>
                <Descriptions.Item label="运行时间" style={{ height: '14px', lineHeight: '14px' }}>{systemInfoData?.uptime || '未知'}</Descriptions.Item>
                <Descriptions.Item label="数据源" style={{ height: '14px', lineHeight: '14px' }}>{systemInfoData?.dataSource || '未知'}</Descriptions.Item>
                <Descriptions.Item label="最后更新" style={{ height: '14px', lineHeight: '14px' }}>{systemInfoData?.lastUpdateTime || '未知'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default HomePage;
