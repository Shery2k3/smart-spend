"use client";
import MainLayout from "@/components/MainLayout/MainLayout";
import { Button, Form, Input, InputNumber, Select, Card, Divider } from "antd";
import { useCurrency } from "@/hooks/useCurrency";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUser } from "@/hooks/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "PKR", label: "PKR - Pakistani Rupee" },
];

export default function UserProfile() {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const { setCurrency } = useCurrency();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: fetchingUser } = useUser(
    session?.user?.userId || ""
  );

  const updateUser = useMutation({
    mutationFn: async (values: { name: string; currency: string; monthlyBudget: number }) => {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.userId,
          name: values.name,
          currency: values.currency,
          monthlyBudget: values.monthlyBudget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      setCurrency(variables.currency);
      localStorage.setItem("userCurrency", variables.currency);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      import("antd").then(({ message }) => {
        message.success("Profile updated successfully!");
      });
    },
    onError: () => {
      import("antd").then(({ message }) => {
        message.error("Failed to update profile");
      });
    },
  });

  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        name: userData.name,
        currency: userData.currency || "USD",
        monthlyBudget: userData.monthlyBudget || 0,
      });
    }
  }, [userData, form]);

  const handleUpdateProfile = async (values: {
    name: string;
    currency: string;
    monthlyBudget: number;
  }) => {
    updateUser.mutate(values);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <MainLayout>
      <div
        style={{
          padding: "16px",
          color: "var(--color-accent)",
        }}
      >
        <h2 style={{ fontSize: "24px", textAlign: "center" }}>Settings</h2>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Card
          style={{ width: "100%", maxWidth: "600px" }}
          loading={fetchingUser}
          bordered={false}
        >
          <h3 style={{ marginBottom: "24px" }}>Profile Settings</h3>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            autoComplete="off"
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please enter your name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input placeholder="Enter your name" />
            </Form.Item>

            <Form.Item
              label="Currency"
              name="currency"
              rules={[{ required: true, message: "Please select a currency" }]}
            >
              <Select
                placeholder="Select your preferred currency"
                options={CURRENCIES}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              label="Monthly Budget"
              name="monthlyBudget"
              tooltip="Set to 0 if you don't want to set budget"
              rules={[
                { required: true, message: "Please enter your monthly budget" },
                { type: "number", min: 0, message: "Budget must be 0 or greater" },
              ]}
            >
              <InputNumber
                placeholder="Enter your monthly budget"
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateUser.isPending}
                size="large"
                block
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "16px" }}>Account Actions</h3>
            {session && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
                danger
                size="large"
              >
                Sign Out
              </Button>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
