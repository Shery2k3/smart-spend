"use client";

import { Button, Card, Typography, Form, Input, Divider, message } from "antd";
import {
  GoogleOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import styles from "./login.module.css";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const { status } = useSession();
  const [form] = Form.useForm();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return null;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      message.error("Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isRegister) {
        // Handle Registration via the custom API route
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.username,
            email: values.email,
            password: values.password,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Registration failed");
        }

        message.success("Account created! Logging you in...");

        // Automatically log the user in after successful registration
        await signIn("credentials", {
          email: values.email,
          password: values.password,
          callbackUrl: "/dashboard",
        });
      } else {
        // Handle standard Credentials login
        const result = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          message.error("Invalid email or password");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard} bordered={false}>
        <Title level={2} className={styles.title}>
          Welcome to SmartSpend
        </Title>
        <p className={styles.textSecondary}>
          {isRegister
            ? "Create an account to get started"
            : "Please sign in to continue"}
        </p>

        <Form
          form={form}
          name="auth_form"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          {isRegister && (
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className={styles.iconColor} />}
                placeholder="Username"
                size="large"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className={styles.iconColor} />}
              placeholder="Email Address"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className={styles.iconColor} />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className={styles.submitButton}
            >
              {isRegister ? "Sign Up" : "Sign In"}
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.toggleText}>
          <a
            onClick={() => {
              setIsRegister(!isRegister);
              form.resetFields();
            }}
          >
            {isRegister
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </a>
        </div>

        <Divider plain className={styles.divider}>
          OR
        </Divider>

        <Button
          icon={<GoogleOutlined />}
          loading={loading}
          onClick={handleGoogleSignIn}
          className={styles.googleButton}
          block
          size="large"
        >
          Continue with Google
        </Button>

        <p
          className={styles.textSecondary}
          style={{ marginTop: "24px", fontSize: "12px" }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
};

export default Login;
