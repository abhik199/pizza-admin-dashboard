import {
    Layout,
    Card,
    Space,
    Form,
    Input,
    Checkbox,
    Button,
    Flex,
    Alert,
} from "antd";
import { LockFilled, UserOutlined, LockOutlined } from "@ant-design/icons";
// import { Link } from 'react-router-dom'
import Logo from "../../components/icons/Logo";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Credentials } from "../../types";
import { login, self, logout } from "../../http/api";
import { useAuthStore } from "../../store";
import { usePermission } from "../../hooks/usePermission";

const loginUser = async (credentials: Credentials) => {
    const { data } = await login(credentials);
    return data;
};
const getSelf = async () => {
    const { data } = await self();
    return data;
};

const Login = () => {
    const { isAllowed } = usePermission();
    const { setUser, logout: logoutFromStore } = useAuthStore();
    const { refetch } = useQuery({
        queryKey: ["self"],
        queryFn: getSelf,
        enabled: false,
    });
    const { mutate: logoutMutate } = useMutation({
        mutationKey: ["logout"],
        mutationFn: logout,
        onSuccess: async () => {
            logoutFromStore();
            return;
        },

        onError: async () => {
            refetch();
        },
    });
    const { mutate, isPending, isError, error } = useMutation({
        mutationKey: ["login"],
        mutationFn: loginUser,
        onSuccess: async () => {
            console.log("login");
            const selfDataPromise = await refetch();

            if (!isAllowed(selfDataPromise.data)) {
                logoutMutate();
                return;
            }
            setUser(selfDataPromise.data);
        },
        onError: async () => {
            console.log("login error");
        },
    });
    return (
        <>
            <Layout
                style={{ height: "100vh", display: "grid", placeItems: "center" }}
            >
                <Space direction="vertical" align="center" size="large">
                    <Layout.Content
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Logo />
                    </Layout.Content>

                    <Card
                        bordered={false}
                        style={{ width: 300 }}
                        title={
                            <Space
                                style={{
                                    width: "100%",
                                    fontSize: 16,
                                    justifyContent: "center",
                                }}
                            >
                                <LockFilled />
                                Sign in
                            </Space>
                        }
                    >
                        <Form
                            initialValues={{
                                remember: true,
                                username: "demo@gmail.com",
                                password: "demo@123",
                            }}
                            onFinish={(values) => {
                                mutate({ email: values.username, password: values.password });
                            }}
                        >
                            {isError && (
                                <Alert
                                    style={{ margin: 24 }}
                                    type="error"
                                    message={error.message}
                                />
                            )}
                            <Form.Item
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a username",
                                    },
                                    {
                                        type: "email",
                                        message: "email is not valid",
                                    },
                                ]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Username" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a password",
                                    },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Password"
                                />
                            </Form.Item>
                            <Flex justify="space-between">
                                <Form.Item name="remember" valuePropName="checked">
                                    <Checkbox>Remember me</Checkbox>
                                </Form.Item>
                                {/* <Link id='login-form-forgot' to='/'>Forgot password</Link> */}
                                <a href="" id="login-form-forgot">
                                    Forgot password
                                </a>
                            </Flex>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{ width: "100%" }}
                                    loading={isPending}
                                >
                                    Log in
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Space>
            </Layout>
        </>
    );
};

export default Login;
