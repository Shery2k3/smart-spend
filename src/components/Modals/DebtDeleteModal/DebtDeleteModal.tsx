"use client";
import React, { useState } from "react";
import { Card, Flex, Modal } from "antd";
import dayjs from "dayjs";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { useDeleteDebt } from '@/hooks/useApi';

interface DebtData {
  _id: string;
  title: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  debtType: "given" | "taken";
  date: string;
}

interface DebtDeleteModalProps {
  record: DebtData;
  onClose?: () => void;
}

const DebtDeleteButton: React.FC<DebtDeleteModalProps> = ({
  record,
  onClose,
}) => {
  const { currency } = useCurrency();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const deleteDebt = useDeleteDebt();

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    await deleteDebt.mutateAsync(record._id);
    setDeleteModalVisible(false);

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <p style={{ width: "100%", textAlign: "center" }} onClick={handleDelete}>
        Delete
      </p>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteDebt.isPending }}
        width={400}
        centered
      >
        <p>
          Are you sure you want to delete this debt record and all of it's
          transaction cycles?
        </p>
        <div style={{ margin: "1rem 0" }}>
          <Card>
            <Flex align="center" justify="space-between">
              <Flex>
                <div></div>
                <div>
                  <h4>{record.title}</h4>
                  <p style={{ fontSize: "12px", opacity: 0.75 }}>
                    {dayjs(record.date).format("DD MMM, YYYY h:mm A")}
                  </p>
                </div>
              </Flex>
              <div>{getCurrencySymbol(currency)}{record.totalAmount}</div>
            </Flex>
          </Card>
        </div>
      </Modal>
    </>
  );
};

export default DebtDeleteButton;
