"use client";
import React, { useState } from "react";
import { Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { useDeleteCategory } from '@/hooks/useApi';

interface CategoryData {
  _id: string;
  categoryName: string;
  budget: number;
  color: string;
}

interface DeleteCategoryButtonProps {
  category: CategoryData;
  onClose?: () => void;
}

const DeleteCategoryButton: React.FC<DeleteCategoryButtonProps> = ({
  category,
  onClose,
}) => {
  const { currency } = useCurrency();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const deleteCategory = useDeleteCategory();

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    await deleteCategory.mutateAsync(category._id);
    setDeleteModalVisible(false);

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
        onClick={handleDelete}
      />

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteCategory.isPending }}
        width={400}
        centered
      >
        <p>Are you sure you want to delete this category?</p>
        <div style={{ margin: "1rem 0" }}>
          <p>
            <strong>Category:</strong> {category.categoryName}
          </p>
          <p>
            <strong>Budget:</strong> {getCurrencySymbol(currency)}{category.budget.toFixed(2)}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default DeleteCategoryButton;
