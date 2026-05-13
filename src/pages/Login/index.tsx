import { Card, Button, Flex, Typography, Form, Input, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate, useModel } from '@umijs/max';
import { useState, useEffect } from 'react';
import avatar from '@/assets/avatar.png';
// import { login } from '@/services/user';
import { login, getUserprofile } from '@/services/auth/UserProfile';
const { Title } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { initialState, setInitialState } = useModel('@@initialState');

    const [password, setPassword] = useState<string>('');
    const [rememberPwd, setRememberPwd] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const savedPwd = localStorage.getItem('rememberedPassword');
        const savedUser = localStorage.getItem('rememberedUsername');
        if (savedPwd && savedUser) {
            form.setFieldsValue({
                username: savedUser,
                password: savedPwd
            });
            setPassword(savedPwd);
            setRememberPwd(true);
        }
    }, [form]);

    const handleRememberChange = (checked: boolean) => {
        setRememberPwd(checked);
        const values = form.getFieldsValue();

        if (!checked) {
            localStorage.removeItem('rememberedPassword');
            localStorage.removeItem('rememberedUsername');
        } else if (values.username && values.password) {
            localStorage.setItem('rememberedPassword', values.password);
            localStorage.setItem('rememberedUsername', values.username);
        }
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        if (rememberPwd && val) {
            const username = form.getFieldValue('username');
            localStorage.setItem('rememberedPassword', val);
            if (username) {
                localStorage.setItem('rememberedUsername', username);
            }
        }
    };

    const handleClearPassword = () => {
        setPassword('');
        form.setFieldsValue({ password: '' });
        if (rememberPwd) {
            localStorage.removeItem('rememberedPassword');
        }
    };

    const handleLogin = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    const response = await login(values); // 注释：实际接口调用

                    // const response = {
                    //     code: 200,
                    //     data: {
                    //         token: 'mock-token-123456',
                    //         realName: values.username
                    //     }
                    // };

                    if (response.code === 200) {
                        if (response.data.token) {
                            localStorage.setItem('token', response.data.token);
                        }

                        if (response.data.menus) {
                            localStorage.setItem('menus', JSON.stringify(response.data.menus));
                        }

                        await setInitialState({
                            ...initialState,
                            id: response.data?.id,
                            name: response.data?.username || values.username,
                            realName: response.data?.realName,
                            avatar: response.data?.avatar ? `http://localhost:8080/${response.data?.avatar}` : avatar,
                            menus: response.data?.menus,
                            permissions: response.data?.permissions || [],
                        });

                        // 获取用户角色信息并存储到本地
                        try {
                            const profileRes = await getUserprofile();
                            if (profileRes.code === 200) {
                                localStorage.setItem('userId', profileRes.data.id || '');
                                localStorage.setItem('roleNames', profileRes.data.roleNames || '');
                            }
                        } catch (e) {
                            console.error('获取用户信息失败:', e);
                        }


                        if (rememberPwd) {
                            localStorage.setItem('rememberedPassword', values.password);
                            localStorage.setItem('rememberedUsername', values.username);
                        }

                        setTimeout(() => {
                            navigate(`/dashboard`);
                            message.success('登录成功！');
                        }, 100);
                        console.log('登录成功');
                    } else {
                        // message.error('登录失败：账号或密码错误');
                        console.log('登录失败:', response);
                    }
                } catch (error) {
                    // message.error('登录出错，请稍后重试');
                    console.error('登录错误:', error);
                }
            })
            .catch(info => {
                console.log('表单验证失败:', info);
                message.error('请填写正确的账号密码');
            });
    };

    return (
        <Flex justify="center" align="center" style={{ height: '100vh' }}>
            <Card style={{ width: 360 }}>
                <Title level={2} style={{ marginBottom: 30, textAlign: 'center' }}>
                    RPA运营管理系统
                </Title>
                <Form
                    form={form}
                    initialValues={{ remember: true }}
                >
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="请输入用户名"
                            size='large'
                            onChange={() => {
                                if (rememberPwd) {
                                    const val = form.getFieldValue('username');
                                    val && localStorage.setItem('rememberedUsername', val);
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input
                            prefix={<LockOutlined />}
                            placeholder="请输入密码"
                            size='large'
                            type={visible ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            suffix={
                                <Flex gap={8} style={{ cursor: 'pointer' }}>
                                    {password && (
                                        <ClearOutlined
                                            onClick={handleClearPassword}
                                            style={{ color: '#999' }}
                                        />
                                    )}
                                    {visible ? (
                                        <EyeOutlined
                                            onClick={() => setVisible(false)}
                                            style={{ color: '#999' }}
                                        />
                                    ) : (
                                        <EyeInvisibleOutlined
                                            onClick={() => setVisible(true)}
                                            style={{ color: '#999' }}
                                        />
                                    )}
                                </Flex>
                            }
                        />
                    </Form.Item>

                    <Form.Item>
                        <Checkbox
                            checked={rememberPwd}
                            onChange={(e) => handleRememberChange(e.target.checked)}
                            style={{ marginBottom: 16 }}
                        >
                            记住我
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="button"
                            block
                            size="large"
                            onClick={handleLogin}
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    );
};

export default Login;