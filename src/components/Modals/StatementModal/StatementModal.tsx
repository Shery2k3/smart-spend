"use client";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Segmented,
  Space,
  message,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import StatementPDF from "../../PDFTemplates/StatementPDF";
import { useMutation } from "@tanstack/react-query";

const { RangePicker } = DatePicker;

interface StatementModalProps {
  onClose?: () => void;
}

const StatementModal: React.FC<StatementModalProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statementType, setStatementType] = useState("monthly");
  const [form] = Form.useForm();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [statementData, setStatementData] = useState<any>(null);

  const fetchStatement = useMutation({
    mutationFn: async (queryParams: URLSearchParams) => {
      const response = await fetch(
        `/api/transactions/statement?${queryParams}`
      );
      if (!response.ok) throw new Error("Failed to fetch statement data");
      return response.json();
    },
    onSuccess: (data, variables) => {
      setStatementData({
        data,
        name: form.getFieldValue("name"),
      });
      handleCancel();
      setIsDownloadModalOpen(true);
    },
    onError: (error) => {
      console.error("Error generating statement:", error);
      message.error("Failed to generate statement");
    },
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setStatementType("monthly");
  };

  const handleSubmit = async (values: any) => {
    const queryParams = new URLSearchParams();
    queryParams.append("type", values.type);

    if (values.type === "monthly") {
      queryParams.append("month", values.month);
      queryParams.append("year", values.year.toString());
    } else if (values.type === "yearly") {
      queryParams.append("year", values.year.toString());
    } else if (values.type === "range") {
      queryParams.append(
        "startDate",
        values.dateRange[0].format("YYYY-MM-DD")
      );
      queryParams.append("endDate", values.dateRange[1].format("YYYY-MM-DD"));
    }

    fetchStatement.mutate(queryParams);
  };

  const handleTypeChange = (value: string) => {
    setStatementType(value);
    form.setFieldValue("type", value); // Add this line to sync form state
    form.resetFields(["month", "year", "dateRange"]); // Only reset the date-related fields
  };

  // Generate year options (current year and past 4 years)
  const currentYear = dayjs().year();
  const yearOptions = Array.from({ length: 5 }, (_, index) => ({
    value: currentYear - index,
    label: (currentYear - index).toString(),
  }));

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: dayjs().month(index).format("MMMM"),
  }));

  const handleDownloadModalClose = () => {
    setIsDownloadModalOpen(false);
    setStatementData(null);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 16px",
        }}
      >
        <Button type="primary" onClick={showModal}>
          Get Statement
        </Button>
      </div>

      <Modal
        title="Generate Statement"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" initialValue="monthly">
            <Segmented
              options={[
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
                { label: "Range", value: "range" },
              ]}
              onChange={handleTypeChange}
              value={statementType}
              block
            />
          </Form.Item>

          <Form.Item
            label="Statement Name"
            name="name"
            rules={[{ required: true, message: "Please enter statement name" }]}
          >
            <Input placeholder="Enter statement name" />
          </Form.Item>

          {statementType === "monthly" && (
            <Space.Compact block style={{ width: "100%" }}>
              <Form.Item
                label="Month"
                name="month"
                rules={[{ required: true, message: "Please select month" }]}
                style={{ width: "50%" }}
              >
                <Select options={monthOptions} placeholder="Select Month" />
              </Form.Item>
              <Form.Item
                label="Year"
                name="year"
                rules={[{ required: true, message: "Please select year" }]}
                style={{ width: "50%" }}
              >
                <Select options={yearOptions} placeholder="Select Year" />
              </Form.Item>
            </Space.Compact>
          )}

          {statementType === "yearly" && (
            <Form.Item
              label="Year"
              name="year"
              rules={[{ required: true, message: "Please select year" }]}
            >
              <Select options={yearOptions} placeholder="Select Year" />
            </Form.Item>
          )}

          {statementType === "range" && (
            <Form.Item
              label="Date Range"
              name="dateRange"
              rules={[{ required: true, message: "Please select date range" }]}
            >
              <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          )}

          <Form.Item
            className="form-buttons"
            style={{ marginBottom: 0, textAlign: "right" }}
          >
            <Button
              style={{ marginRight: 8 }}
              loading={fetchStatement.isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="primary" loading={fetchStatement.isPending} htmlType="submit">
              Generate
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Download Statement"
        open={isDownloadModalOpen}
        onCancel={handleDownloadModalClose}
        footer={null}
        centered
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <h3>Your statement is ready!</h3>
          <p>Click below to download your statement</p>

          {statementData && (
            <PDFDownloadLink
              document={
                <StatementPDF
                  data={statementData.data}
                  statementName={statementData.name}
                />
              }
              fileName={`${statementData.name}.pdf`}
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "#cdf345",
                color: "#000",
                borderRadius: "6px",
                textDecoration: "none",
                margin: "20px 0",
              }}
            >
              {({ loading }) =>
                loading ? "Preparing Download..." : "Download Statement"
              }
            </PDFDownloadLink>
          )}
        </div>
      </Modal>
    </>
  );
};

export default StatementModal;
