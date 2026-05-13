import { Card, Col, Divider, Row, Typography } from "antd";
import { useNavigate } from "@umijs/max";
const { Title, Text } = Typography;
interface DataMiniProps {
    img: string;
    cname: string;
    mainNumber: number;
    otherNumber: number;
    str: string;
    onClick?: () => void;
}

const DataMini: React.FC<DataMiniProps> = ({ img, cname, mainNumber, otherNumber, str, onClick }) => {
    const color = ['#eb2323ff', '#6f87ffff', '#73c7ffff', '#3af54cff'];
    let bgColor = '';

    switch (cname) {
        case '总任务数':
            bgColor = color[0];
            break;
        case '机器人总数':
            bgColor = color[1];
            break;
        case '流程总数':
            bgColor = color[2];
            break;
        case '数据总量':
            bgColor = color[3];
            break;
    }

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Card onClick={handleClick} style={{ minWidth: '200px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', cursor: 'pointer' }}>
            <Row wrap={false} justify="start" align="middle" >
                <Col>
                    <img src={img} style={{ width: '60px', height: '60px', backgroundColor: bgColor, padding: '12px', borderRadius: '8px' }} />
                </Col>
                <Col style={{ marginLeft: '20px' }}>
                    <Title ellipsis level={2} style={{
                        color: '#000000ff',
                    }}>
                        {mainNumber}
                    </Title>
                    <Text style={{
                        color: '#575757ff',
                    }}>
                        {cname}
                    </Text>
                </Col>
            </Row>
            <Divider size="small" />
            <Row >
                <Text style={{ color: '#747474ff', fontSize: '12px' }}>{str} {otherNumber}</Text>
            </Row>
        </Card >
    );
};

export default DataMini;