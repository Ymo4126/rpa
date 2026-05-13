import { Card, Col, Divider, Row, Typography } from "antd";
import DataMini from "./DataMini";
import { RightOutlined } from "@ant-design/icons";
import { useNavigate } from "@umijs/max";
const { Title, Text } = Typography;
interface FastButtonProps {
    img: string;
    cname: string;
    str: string;
    onClick?: () => void;
}

const FastButton: React.FC<FastButtonProps> = ({ img, cname, str, onClick }) => {
    const navigate = useNavigate();
    const color = ['#e6a23c', '#303133', '#67c23a', '#f56c6c'];
    let bgColor = '';

    switch (cname) {
        case '创建任务':
            bgColor = color[0];
            break;
        case '流程定义':
            bgColor = color[1];
            break;
        case '机器人列表':
            bgColor = color[2];
            break;
        case '数据查询':
            bgColor = color[3];
            break;
    }

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            const pathMap: any = {
                '创建任务': '/rpa/task-list',
                '流程定义': '/rpa/process-definition',
                '机器人列表': '/rpa/robot-list',
                '数据查询': '/rpa/data-collection'
            };
            navigate(pathMap[cname] || '/');
        }
    };

    return (
        <>
            <style>{`
                .fast-button-card:hover {
                    transform: translateX(10px);
                    border-color: #1890ff;
                    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
                    background-color: #e6f7ff;
                }
                .fast-button-card:hover img {
                    transform: scale(1.05);
                }
                
            `}</style>
            <Card
                bodyStyle={{ padding: 14 }}
                style={{ height: '68px', transition: 'all 0.3s ease', cursor: 'pointer' }}
                className="fast-button-card"
                onClick={handleClick}
            >
                <Row align="middle" style={{ height: '100%' }}>
                    <Col flex="0 0 auto" style={{ marginRight: '14px' }}>
                        <img src={img} style={{ width: '38px', height: '38px', padding: '8px', borderRadius: '8px', backgroundColor: bgColor, transition: 'all 0.3s ease' }} />
                    </Col>
                    <Col flex="auto" style={{ minWidth: 0, transition: 'all 0.3s ease' }}>
                        <Title ellipsis style={{
                            color: '#000000ff',
                            transition: 'all 0.3s ease',
                            marginTop: 0,
                            fontSize: '14px',
                            marginBottom: 0,
                        }}>
                            {cname}
                        </Title>
                        <Text ellipsis style={{
                            color: '#575757ff',
                            fontSize: '12px',
                            transition: 'all 0.3s ease',
                            marginTop: 0,
                            display: 'block',
                        }}>
                            {str}
                        </Text>
                    </Col>
                    <Col flex="0 0 auto" style={{ marginLeft: '10px' }}>
                        <RightOutlined style={{ fontSize: '16px', color: '#d4d4d4ff', transition: 'all 0.3s ease' }} />
                    </Col>
                </Row>
            </Card>
        </>
    );
};

export default FastButton;
