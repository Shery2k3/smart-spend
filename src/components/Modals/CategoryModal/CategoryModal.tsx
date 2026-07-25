"use client";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Card,
  Modal,
  Form,
  Input,
  Button,
  InputNumber,
  ColorPicker,
} from "antd";
import { useEffect, useState } from "react";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useApi';

interface CategoryModalProps {
  isEdit?: boolean;
  initialValues?: {
    _id?: string;
    categoryName: string;
    budget: number;
    color: string;
  };
  onClick?: () => void;
  onSuccess?: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isEdit = false,
  initialValues,
  onClick,
  onSuccess,
}) => {
  const { currency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const loading = createCategory.isPending || updateCategory.isPending;

  useEffect(() => {
    if (initialValues && isModalOpen) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues, isModalOpen]);

  const showModal = () => {
    setIsModalOpen(true);
    onClick?.();
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const capitalizeString = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
  };

  const handleSubmit = async (values: {
    categoryName: string;
    budget: number;
    color: string | { toHexString: () => string };
  }) => {
    const formattedValues = {
      ...values,
      categoryName: capitalizeString(values.categoryName),
      color:
        typeof values.color === "string"
          ? values.color
          : values.color.toHexString(),
    };

    if (isEdit && initialValues?._id) {
      await updateCategory.mutateAsync({
        _id: initialValues._id,
        ...formattedValues,
      });
    } else {
      await createCategory.mutateAsync(formattedValues);
    }

    form.resetFields();
    setIsModalOpen(false);
    onSuccess?.();
  };

  return (
    <>
      {!isEdit ? (
        <Card
          style={{
            width: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          hoverable
          bordered={false}
          onClick={showModal}
        >
          <PlusOutlined style={{ fontSize: "24px", color: "#8c8c8c" }} />
        </Card>
      ) : (
        <Button
          type="text"
          onClick={showModal}
          icon={<EditOutlined style={{ color: "#fff", fontSize: "16px" }} />}
          aria-label="Edit category"
        />
      )}

      <Modal
        title={isEdit ? "Edit Category" : "Add New Category"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="categoryName"
            label="Category Name"
            rules={[
              {
                required: true,
                message: "Please input the category name!",
              },
            ]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Form.Item
            label="Budget"
            name="budget"
            initialValue={0}
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber prefix={getCurrencySymbol(currency)} style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: "Please select a color" }]}
          >
            <ColorPicker format="hex" />
          </Form.Item>
          <Form.Item>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CategoryModal;
