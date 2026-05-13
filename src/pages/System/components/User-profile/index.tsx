import { Typography, Card, Button, Col, Row, Avatar, Space, Descriptions, Form, Input, message, Modal, Upload, notification } from 'antd';
import { formatTime } from '@/utils/timeFormat';
import { InboxOutlined } from '@ant-design/icons';
const { Title } = Typography;
const { Dragger } = Upload;
import avatar from '@/assets/avatar.png';
import { getUserprofile, modifyUserprofile, modifyUserPassword, uploadUserAvatar } from '@/services/auth/UserProfile';
import { useEffect, useState } from 'react';
import { useModel } from '@umijs/max';


const UserProfile = () => {
    const [updateForm] = Form.useForm();
    const resetUpdate = () => {
        updateForm.resetFields(['realName', 'email', 'phone']);
    }
    const [passwordForm] = Form.useForm();
    const resetPassword = () => {
        passwordForm.resetFields(['oldPassword', 'newPassword', 'confirmPassword']);
    }

    const [data, setData] = useState({});
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { setInitialState } = useModel('@@initialState');


    const save = async (values: any) => {
        if (!values.realName) {
            message.error('请输入姓名');
            return;
        }
        if (!values.email) {
            message.error('请输入邮箱');
            return;
        }
        if (!values.phone) {
            message.error('请输入手机号');
            return;
        }
        try {
            const res = await modifyUserprofile(values);
            if (res.code === 200) {
                message.success('修改成功');
                getUserProfile();
                resetUpdate();
            } else {
                console.log(res);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const uppdataPassword = async (values: any) => {
        if (!values.oldPassword) {
            message.error('请输入旧密码');
            return;
        }
        if (!values.newPassword) {
            message.error('请输入新密码');
            return;
        }
        if (!values.confirmPassword) {
            message.error('请确认新密码');
            return;
        }
        if (values.newPassword !== values.confirmPassword) {
            message.error('两次输入密码不一致');
            return;
        }
        try {
            const res = await modifyUserPassword(values);
            if (res.code === 200) {
                message.success('修改成功');
                resetPassword();
            } else {
                console.log(res);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleAvatarUpload = async (file) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const avatarFile = new File([file], 'avatar', { type: file.type });
            formData.append('avatar', avatarFile);
            const res = await uploadUserAvatar(formData);
            if (res.code === 200) {
                message.success('头像上传成功');
                setAvatarModalVisible(false);
                setFileList([]);
                getUserProfile();
            } else {
                console.log(res);
            }
        } catch (error) {
            console.error('上传失败:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (info: any) => {
        if (info.file.status === 'removed') {
            setFileList([]);
        } else if (info.file.status === 'done') {
            setFileList([info.file]);
        } else if (info.fileList.length > 0) {
            setFileList([info.fileList[info.fileList.length - 1]]);
        }
    };
    const getUserProfile = async () => {
        const res = await getUserprofile();
        setData(res.data);
        console.log(res);

        const newAvatar = res.data?.avatar ? `http://localhost:8080/${res.data.avatar}` : '';
        setInitialState((prev) => ({
            ...prev,
            avatar: newAvatar
        }));
    }
    useEffect(() => {
        getUserProfile();
    }, []);
    return (
        <>
            <Title level={4}>个人信息</Title>
            <Card title="基本信息">
                <Row justify="start" align="top" gutter={24}>
                    <Col span={6} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar src={data.avatar ? `http://localhost:8080/${data.avatar}` : avatar} size={100} />
                            <Button type="link" onClick={() => setAvatarModalVisible(true)}>更换头像</Button>
                        </div>
                    </Col>
                    <Col span={18}>
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="用户名">{data.username}</Descriptions.Item>
                            <Descriptions.Item label="姓名">{data.realName}</Descriptions.Item>
                            <Descriptions.Item label="邮箱">{data.email}</Descriptions.Item>
                            <Descriptions.Item label="手机号">{data.phone}</Descriptions.Item>
                            <Descriptions.Item label="角色">{data.roleNames}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{typeof formatTime !== 'undefined' ? formatTime(data.createTime) : (data.createTime || '-')}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>
            <Card title="修改信息" style={{ marginTop: 24 }}>
                <Form layout="horizontal" onFinish={save} form={updateForm}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="姓名" name="realName" >
                                <Input placeholder="请输入姓名" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="邮箱" name="email">
                                <Input placeholder="请输入邮箱" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="手机号" name="phone">
                                <Input placeholder="请输入手机号" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" style={{ marginTop: 12 }} htmlType="submit">保存</Button>
                    <Button style={{ marginTop: 12, marginLeft: 12 }} onClick={resetUpdate}>重置</Button>
                </Form>
            </Card>
            <Card title="修改密码" style={{ marginTop: 24 }}>
                <Form layout="horizontal" onFinish={uppdataPassword} form={passwordForm}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="旧密码" name="oldPassword">
                                <Input placeholder="请输入旧密码" type="password" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="新密码" name="newPassword">
                                <Input placeholder="请输入新密码" type="password" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="确认新密码" name="confirmPassword">
                                <Input placeholder="请确认新密码" type="password" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" style={{ marginTop: 12 }} htmlType="submit">修改密码</Button>
                    <Button style={{ marginTop: 12, marginLeft: 12 }} onClick={resetPassword}>重置</Button>
                </Form>

            </Card>

            <Modal
                title="更换头像"
                open={avatarModalVisible}
                onCancel={() => {
                    setAvatarModalVisible(false);
                    setFileList([]);
                }}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setAvatarModalVisible(false);
                        setFileList([]);
                    }}>
                        取消
                    </Button>,
                    <Button
                        key="upload"
                        type="primary"
                        loading={uploading}
                        onClick={() => {
                            if (fileList.length > 0) {
                                handleAvatarUpload(fileList[0].originFileObj);
                            } else {
                                message.error('请选择文件');
                            }
                        }}
                    >
                        上传
                    </Button>,
                ]}
                width={500}
            >
                <Dragger
                    name="file"
                    multiple={false}
                    accept=".jpg,.png"
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={() => false}
                    maxCount={1}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                    <p className="ant-upload-hint">
                        支持 jpg、png 格式文件，大小不超过 2MB
                    </p>
                </Dragger>
            </Modal>
        </>
    )
};
export default UserProfile;
