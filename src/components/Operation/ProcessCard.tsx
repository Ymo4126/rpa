import { DeleteOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Row, Tag, Typography } from "antd";
import ProcessCode from "./ProcessCode";
import { useState } from "react";
const { Title, Text } = Typography;
interface RobotDataProps {
    id: number;
    stepOrder: number;
    stepName: string;
    scriptType: string;
    scriptContent: string;
    onDelete?: () => void;
    onUpdate?: (id: number, data: { stepName: string; scriptType: string; scriptContent: string }) => void;
}
const ProcessCard: React.FC<RobotDataProps> = ({ id, stepOrder, stepName, scriptType, scriptContent, onDelete, onUpdate }) => {
    const [expanded, setExpanded] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleUpdate = (data: { stepName: string; scriptType: string; scriptContent: string }) => {
        if (onUpdate) {
            onUpdate(id, data);
        }
    };

    return (
        <>
            <style>{`
                .process-card:hover {
                    border-color:  #5a9be4 ;
                    box-shadow: 0 0 10px #5a9be4 !important;
                    cursor: pointer;
                }
                .delete-btn:hover {
                    color: #ff8080ff !important;
                }
            `}</style>
            <Card className="process-card" style={{ height: expanded ? 'auto' : '140px', boxShadow: '0 0 2px #c6c6c6ff', marginBottom: expanded ? '16px' : '0' }} onClick={handleCardClick}>
                <Row justify="start" align="top" gutter={[8, 24]}>
                    <Col span={2} style={{}} >
                        <div style={{ backgroundColor: '#5a9be4', color: '#ffffff', textAlign: 'center', height: '26px', width: '26px', borderRadius: '50%', padding: '2px' }}>
                            {stepOrder}
                        </div>
                    </Col>
                    <Col span={20} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Title ellipsis level={5} style={{
                            color: '#616161ff',
                            marginBottom: '0px',
                        }}>
                            {stepName}
                        </Title>
                        <Tag style={{
                            backgroundColor: '#fdd3d3ff',
                            color: '#d01a1aff',
                            border: '1px solid #ff9898ff',
                            width: 'fit-content',
                            fontSize: '12px',
                        }}>
                            {scriptType}
                        </Tag>
                        <Text style={{
                            color: '#575757ff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '12px',
                        }}>
                            {scriptContent}
                        </Text>
                        {expanded ? <UpOutlined style={{ color: '#5a9be4', alignSelf: 'center' }} /> : <DownOutlined style={{ color: '#5a9be4', alignSelf: 'center' }} />}
                    </Col>
                    <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <DeleteOutlined className="delete-btn" style={{ border: 'none', color: '#ff0000ff' }} onClick={(e) => { e.stopPropagation(); onDelete?.(); }} />
                    </Col>
                </Row>
                {expanded && (
                    <div style={{ marginTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                        <ProcessCode
                            stepName={stepName}
                            scriptContent={scriptContent}
                            scriptType={scriptType}
                            onUpdate={handleUpdate}
                        />
                    </div>
                )}
            </Card>
        </>
    )
}
export default ProcessCard;

