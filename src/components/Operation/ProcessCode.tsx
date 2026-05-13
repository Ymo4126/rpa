import { Button, Card, Col, Divider, Input, Form, Row, Tag, Typography, Select } from "antd";
const { Title, Text } = Typography;
import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from "react";
interface ProcessCodeProps {
    stepName: string;
    scriptContent: string;
    scriptType: string;
    onUpdate: (data: { stepName: string; scriptType: string; scriptContent: string }) => void;
}

const ProcessCode: React.FC<ProcessCodeProps> = ({ stepName, scriptContent, scriptType, onUpdate }) => {
    const [form] = Form.useForm();
    const [codes, setCodes] = useState(scriptContent);
    const [types, setTypes] = useState(scriptType);
    const [cnames, setCnames] = useState(stepName);

    useEffect(() => {
        onUpdate({ stepName: cnames, scriptType: types, scriptContent: codes });
    }, [codes, types, cnames]);

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.name !== undefined) {
            setCnames(allValues.name);
        }
        if (changedValues.type !== undefined) {
            setTypes(allValues.type);
        }
    };

    return (
        <>
            <Card>
                <Divider size="small" style={{ fontSize: 14, color: '#707070ff' }}>步骤配置</Divider>
                <Form form={form} layout="inline" style={{ marginBottom: '16px', width: '100%', justifyContent: 'center' }} initialValues={{ name: stepName, type: scriptType }} onValuesChange={handleValuesChange}>
                    <Form.Item label="步骤名称" name="name" style={{ width: '40%' }}>
                        <Input style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="编程语言" name="type" style={{ width: '40%' }}>
                        <Select style={{ width: '100%' }}
                            options={[
                                { label: 'JavaScript', value: 'javascript' },
                                { label: 'Java', value: 'java' },
                                { label: 'Groovy', value: 'groovy' },
                            ]}
                        />
                    </Form.Item>
                </Form>

                <Editor
                    height="400px"
                    language={scriptType.toLowerCase()}
                    value={codes}
                    theme="vs-dark"
                    onChange={(value) => setCodes(value || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                />
            </Card>
        </>
    )
}
export default ProcessCode;

