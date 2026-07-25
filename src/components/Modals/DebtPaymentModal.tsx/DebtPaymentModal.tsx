"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Modal,
  Form,
  Segmented,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Space,
  Select,
  Button,
} from "antd";
import dayjs from "dayjs";
import EmptyState from "@/components/EmptyState/EmptyState";
import { EditOutlined } from "@ant-design/icons";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { 
  useCategories, 
  useCreateDebtPayment, 
  useUpdateDebtPayment 
} from '@/hooks/useApi';

interface DebtData {
  _id: string;
  title: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  debtType: "given" | "taken";
  date: string;
}

interface DebtTransaction {
  _id: string;
  type: "return" | "add";
  amount: number;
  date: string;
  notes?: string;
  reason?: string;
  category?: string;
}

interface DebtPaymentModalProps {
  record: DebtData;
  transaction?: DebtTransaction;
  isEdit?: boolean;
  onClose?: () => void;
}

const DebtPaymentButton: React.FC<DebtPaymentModalProps> = ({
  record,
  transaction,
  isEdit = false,
  onClose,
}) => {
  const { currency } = useCurrency();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentType, setPaymentType] = useState<"return" | "add">("return");
  const [form] = Form.useForm();
  const [calculatedRemaining, setCalculatedRemaining] = useState(
    record.amountRemaining
  );

  // Query hooks
  const { data: categoriesData = [] } = useCategories();
  const createDebtPayment = useCreateDebtPayment();
  const updateDebtPayment = useUpdateDebtPayment();
  
  const loading = createDebtPayment.isPending || updateDebtPayment.isPending;
  
  const categories = categoriesData.map((cat: any) => ({
    value: cat.category,
    label: cat.category,
  }));

  const handlePaymentClick = () => {
    if (!isEdit) {
      const now = dayjs();
      console.log(now);
      form.setFieldsValue({
        date: now,
        time: now,
      });
    }
    setPaymentModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setPaymentModalVisible(false);
  };

  const handleSubmit = async (values: any) => {
    const combinedDateTime =
      values.date && values.time
        ? dayjs(values.date)
            .hour(dayjs(values.time).hour())
            .minute(dayjs(values.time).minute())
            .second(0)
            .millisecond(0)
            .utc()
            .toISOString()
        : null;

    const formattedValues = {
      type: paymentType,
      amount: values.amount,
      date: combinedDateTime,
      notes: values.notes,
      category: values.category,
      reason: values.reason,
      title: values.title,
    };

    if (isEdit && transaction) {
      await updateDebtPayment.mutateAsync({
        _id: transaction._id,
        debtId: record._id,
        ...formattedValues,
      });
    } else {
      await createDebtPayment.mutateAsync({
        debtId: record._id,
        ...formattedValues,
      });
    }

    setPaymentModalVisible(false);
    form.resetFields();

    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (paymentType === "return") {
      // Subtracting payment from debt
      if (amount > record.amountRemaining) {
        setCalculatedRemaining(0);
      } else {
        setCalculatedRemaining(record.amountRemaining - amount);
      }
    } else {
      // Adding to debt
      setCalculatedRemaining(record.amountRemaining + amount);
    }
  }, [form, amount, record.amountRemaining, paymentType]);

  useEffect(() => {
    if (isEdit && transaction) {
      const datetime = dayjs(transaction.date);
      form.setFieldsValue({
        paymentType: transaction.type,
        amount: transaction.amount,
        date: datetime,
        time: datetime,
        category: transaction.category,
        reason: transaction.reason,
        notes: transaction.notes,
      });
      setPaymentType(transaction.type);
      setAmount(transaction.amount);
    }
  }, [isEdit, transaction, form]);

  return (
    <>
      {isEdit ? (
        <EditOutlined
          onClick={handlePaymentClick}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <p
          style={{ width: "100%", textAlign: "center" }}
          onClick={handlePaymentClick}
        >
          Pay
        </p>
      )}

      <Modal
        title={isEdit ? "Edit Payment" : "Debt Payment"}
        open={paymentModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="paymentType" initialValue="return">
            <Segmented
              options={[
                { label: "Return Payment", value: "return" },
                { label: "Add to Debt", value: "add" },
              ]}
              onChange={(value) => setPaymentType(value as "return" | "add")}
              block
            />
          </Form.Item>

          {paymentType === "add" && record.debtType === "taken" && (
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
          )}

          <Form.Item
            label="Amount"
            name="amount"
            initialValue={0}
            rules={[
              { required: true, message: "Please enter amount" },
              () => ({
                validator(_, value) {
                  if (
                    paymentType === "return" &&
                    value > record.amountRemaining
                  ) {
                    return Promise.reject(
                      "Amount cannot be greater than remaining amount"
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              prefix={getCurrencySymbol(currency)}
              style={{ width: "100%" }}
              min={0}
              onChange={(value) => setAmount(value ?? 0)}
              onBlur={(e) => {
                const value = e.target.value;
                if (!value) {
                  form.setFieldsValue({ amount: 0 });
                  setAmount(0);
                }
              }}
            />
          </Form.Item>

          <Space.Compact block style={{ width: "100%" }}>
            <Form.Item
              label="Time"
              name="time"
              rules={[{ required: true, message: "Please select time" }]}
              style={{ width: "50%" }}
            >
              <TimePicker
                format="hh:mm A"
                style={{ width: "100%" }}
                use12Hours
              />
            </Form.Item>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Please select date" }]}
              style={{ width: "50%" }}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Space.Compact>

          {paymentType === "add" && record.debtType === "taken" && (
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                options={categories}
                placeholder="Select Category"
                loading={categories.length === 0}
                notFoundContent={
                  <EmptyState description="No categories found" />
                }
              />
            </Form.Item>
          )}

          <Form.Item label="Reason" name="reason" rules={[{ required: false }]}>
            <Input.TextArea placeholder="Enter Reason" />
          </Form.Item>

          <div style={{ margin: "1rem 0 1.5rem 0" }}>
            <Card>
              <Flex align="center" justify="space-between">
                <p>Remaining Amount</p>
                <h3>{getCurrencySymbol(currency)} {calculatedRemaining}</h3>
              </Flex>
            </Card>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel} loading={loading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit
                  ? "Update"
                  : paymentType === "return"
                  ? "Return Payment"
                  : "Add to Debt"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DebtPaymentButton;
