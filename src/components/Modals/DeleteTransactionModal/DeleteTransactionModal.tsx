"use client";
import React, { useState } from "react";
import { Modal } from "antd";
import dayjs from "dayjs";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { useDeleteTransaction } from '@/hooks/useApi';

interface TransactionData {
  _id: string;
  date: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  category: string;
  notes?: string;
}

interface DeleteTransactionButtonProps {
  record: TransactionData;
  onClose?: () => void;
}

const DeleteTransactionButton: React.FC<DeleteTransactionButtonProps> = ({
  record,
  onClose,
}) => {
  const { currency } = useCurrency();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    await deleteTransaction.mutateAsync(record._id);
    setDeleteModalVisible(false);

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <p style={{width: "100%",  textAlign: "center" }} onClick={handleDelete}>
        Delete
      </p>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteTransaction.isPending }}
        width={400}
        centered
      >
        <p>Are you sure you want to delete this transaction?</p>
        <div style={{ margin: "1rem 0" }}>
          <p>
            <strong>Title:</strong> {record.title}
          </p>
          <p>
            <strong>Amount:</strong> {getCurrencySymbol(currency)}{record.amount.toFixed(2)}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {dayjs(record.date).format("hh:mm A, DD/MM/YYYY")}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default DeleteTransactionButton;
