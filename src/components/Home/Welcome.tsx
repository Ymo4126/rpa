import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Typography, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';


const { Title, Text } = Typography;

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekDay = weekDays[now.getDay()];
      setCurrentDate(`今天是${year}年${month}月${day}日 星期${weekDay}，系统运行正常`);
    };

    updateDate();
    const timer = setInterval(updateDate, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card style={{
      background: 'linear-gradient(135deg, #6f87ffff 0%, #73c7ffff 100%)',
      borderRadius: '8px',
      minHeight: '150px',
      padding: '10px 20px',
      border: 'none'
    }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2} style={{
            color: '#fff',
            letterSpacing: '2px',
            marginBottom: '16px'
          }}>
            欢迎使用系统!
          </Title>
          <Text style={{
            fontSize: '16px',
            opacity: 0.9,
            fontWeight: 300,
            color: '#fff'
          }}>{currentDate}</Text>
        </Col>
        <Col>
          <Button type="primary" style={{
            height: '40px',
            padding: '10px 20px',
            // fontSize: '18px',
            borderRadius: '10px',
            // fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }} onClick={() => navigate('/rpa/task-list')}>
            <PlusOutlined />
            创建任务
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default Welcome;
