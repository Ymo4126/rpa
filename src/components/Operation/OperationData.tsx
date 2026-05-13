import { Card, Col, Divider, Row, Typography } from "antd";
const { Title, Text } = Typography;
interface RobotDataProps {
    cname: string;
    cnumber: number;
}

const OperationData: React.FC<RobotDataProps> = ({ cname, cnumber }) => {
    const color = ['#e6a23c', '#72a1ffff', '#67c23a', '#ff0e0eff'];
    let bgColor = '';

    if (cname === '总机器人数' || cname === '总采集数' || cname === '总解析数' || cname === '总加工数') {
        bgColor = color[1];
    } else if (cname === '采集中' || cname === '工作中' || cname === '解析中' || cname === '加工中') {
        bgColor = color[0];
    } else if (cname === '在线' || cname === '成功') {
        bgColor = color[2];
    } else if (cname === '离线' || cname === '失败') {
        bgColor = color[3];
    }
    return (
        <Row wrap={false} justify='center' align="middle" style={{ boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.1)', height: '120px' }}>
            <Col style={{ textAlign: 'center' }} >
                <Title ellipsis level={2} style={{
                    color: bgColor,
                }}>
                    {cnumber}
                </Title>
                <Text style={{
                    color: '#575757ff',
                    fontSize: '14px',
                }}>
                    {cname}
                </Text>
            </Col>
        </Row>
    );
};

export default OperationData;
