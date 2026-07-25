"use client";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Segmented,
  TimePicker,
  Space,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./TransactionModal.module.css";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import EmptyState from "@/components/EmptyState/EmptyState";

dayjs.extend(utc);

interface TransactionModalProps {
  isEdit?: boolean;
  record?: {
    _id: string;
    date: string;
    type: "income" | "expense" | "debt";
    title: string;
    amount: number;
    category: string;
    notes?: string;
  };
  onClose?: () => void;
}

interface CategoryOption {
  value: string;
  label: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isEdit = false,
  record,
  onClose,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [debtType, setDebtType] = useState<"given" | "taken">("taken");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    if (isEdit && record) {
      const datetime = dayjs(record.date);
      const normalizedType = record.type.toLowerCase() as
        | "income"
        | "expense"
        | "debt";

      // Get debtType from record if it exists (for debt transactions)
      const debtTypeValue = (record as any).debtType;

      form.setFieldsValue({
        type: normalizedType,
        title: record.title,
        amount: record.amount,
        date: datetime,
        time: datetime,
        category: record.category,
        notes: record.notes,
        debtType: debtTypeValue || "taken",
      });
      setTransactionType(normalizedType);

      if (debtTypeValue) {
        setDebtType(debtTypeValue);
      }
    }
  }, [isEdit, record, form, isModalOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();

        const categoryOptions = data.map((cat: any) => ({
          value: cat.category,
          label: cat.category,
        }));

        setCategories(categoryOptions);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Failed to load categories");
      }
    };

    if (isModalOpen) {
      fetchCategories();
    }
  }, [isModalOpen]);

  const showModal = () => {
    if (!isEdit) {
      const now = dayjs();
      form.setFieldsValue({
        date: now,
        time: now,
      });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setTransactionType("expense");
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const combinedDateTime =
        values.date && values.time
          ? dayjs(values.date)
              .hour(values.time.hour())
              .minute(values.time.minute())
              .second(0)
              .millisecond(0)
              .utc()
              .toISOString()
          : null;

      // Check if this is a debt transaction
      if (values.type === "debt") {
        const debtPayload = {
          title: values.title,
          totalAmount: values.amount,
          debtType: values.debtType,
          date: combinedDateTime,
          notes: values.notes,
        };

        if (isEdit && record) {
          const response = await fetch(`/api/debts?id=${record._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(debtPayload),
          });

          if (!response.ok) {
            throw new Error("Failed to update debt");
          }

          message.success("Debt updated successfully");
        } else {
          // Create new debt
          const response = await fetch("/api/debts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(debtPayload),
          });

          if (!response.ok) {
            throw new Error("Failed to create debt");
          }

          message.success("Debt added successfully");
        }
      } else {
        // Handle regular income/expense transactions
        const formattedValues = {
          type: values.type,
          title: values.title,
          amount: values.amount,
          date: combinedDateTime,
          category: values.category,
          notes: values.notes,
        };

        if (isEdit && record) {
          const response = await fetch(`/api/transactions`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _id: record._id,
              ...formattedValues,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update transaction");
          }

          message.success("Transaction updated successfully");
        } else {
          // Create new transaction
          const response = await fetch("/api/transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedValues),
          });

          if (!response.ok) {
            throw new Error("Failed to create transaction");
          }

          message.success("Transaction added successfully");
        }
      }

      setIsModalOpen(false);
      form.resetFields();
      setTransactionType("expense");

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating/updating transaction:", error);
      message.error(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setTransactionType(value);
  };

  return (
    <>
      {isEdit ? (
        <p style={{ textAlign: "center" }} onClick={showModal}>
          Edit
        </p>
      ) : (
        <div className={styles.floatingButton}>
          <Button
            type="primary"
            icon={<PlusOutlined style={{ color: "#121212" }} />}
            onClick={showModal}
            shape="circle"
            size="large"
          />
        </div>
      )}

      <Modal
        title={isEdit ? "Edit Transaction" : "Add Transaction"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" initialValue="expense">
            <Segmented
              options={
                !isEdit
                  ? [
                      { label: "Expense", value: "expense" },
                      { label: "Income", value: "income" },
                      { label: "Debt", value: "debt" },
                    ]
                  : [
                      { label: "Expense", value: "expense" },
                      { label: "Income", value: "income" },
                      { label: "Debt", value: "debt" },
                    ]
              }
              onChange={handleTypeChange}
              value={transactionType}
              block
            />
          </Form.Item>

          {transactionType === "debt" && (
            <Form.Item
              label="Debt Type"
              name="debtType"
              initialValue="taken"
              rules={[{ required: true, message: "Please select debt type" }]}
            >
              <Select
                onChange={(value) => setDebtType(value)}
                style={{ width: "100%" }}
                options={[
                  { value: "taken", label: "Taken" },
                  { value: "given", label: "Given" },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item
            label={
              transactionType === "debt"
                ? debtType === "taken"
                  ? "Lender's Name"
                  : "Debtor's Name"
                : "Title"
            }
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input
              placeholder={
                transactionType === "debt"
                  ? debtType === "taken"
                    ? "Enter lender's name"
                    : "Enter debtor's name"
                  : "Enter title"
              }
            />
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            initialValue={0}
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber prefix="Rs." style={{ width: "100%" }} min={0} />
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

          {!!(transactionType === "expense" ||
            (transactionType === "debt" && debtType === "taken")) && (
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

          <Form.Item
            label={transactionType === "debt" ? "Reason" : "Notes"}
            name="notes"
          >
            <Input.TextArea
              placeholder={
                transactionType === "debt" ? "Enter reason" : "Enter notes"
              }
            />
          </Form.Item>

          <Form.Item
            className="form-buttons"
            style={{ marginBottom: 0, textAlign: "right" }}
          >
            <Button
              style={{ marginRight: 8 }}
              loading={loading}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="primary" loading={loading} htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TransactionModal;
