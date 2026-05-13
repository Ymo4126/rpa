import { Card, Col, Divider, Row, Typography } from "antd";
import DataMini from "./DataMini";
const { Title, Text } = Typography;
interface TaskMiniProps {
    cname: string;
    mainNumber: number;
}

const TaskMini: React.FC<TaskMiniProps> = ({ cname, mainNumber }) => {
    const color = ['#e6a23c', '#303133', '#67c23a', '#f56c6c'];
    let bgColor = '';

    switch (cname) {
        case '运行中':
            bgColor = color[0];
            break;
        case '待执行':
            bgColor = color[1];
            break;
        case '已完成':
            bgColor = color[2];
            break;
        case '失败':
            bgColor = color[3];
            break;
    }
    return (
        <Row wrap={false} justify="center" align="middle" >
            <Col>
                <div style={{ height: '12px', width: '12px', backgroundColor: bgColor, borderRadius: '50%' }}></div>
            </Col>
            <Col style={{ marginLeft: '10px' }}>
                <Title ellipsis level={3} style={{
                    color: '#000000ff',
                }}>
                    {mainNumber}
                </Title>
                <Text style={{
                    color: '#575757ff',
                    fontSize: '12px',
                }}>
                    {cname}
                </Text>
            </Col>
        </Row>
    );
};

export default TaskMini;
