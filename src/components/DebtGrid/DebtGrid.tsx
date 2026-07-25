"use client";
import React, { useState } from "react";
import DebtCard from "../DebtCard/DebtCard";
import { Segmented } from "antd";
import LoadingSkeleton from "../HelperComponents/LoadingSkeleton";
import NoTransactions from "../HelperComponents/NoTransactions";
import { useDebts } from '@/hooks/useApi';

interface DebtTransaction {
  _id: string;
  type: "return" | "add";
  amount: number;
  date: string;
  reason?: string;
  category?: string;
}

interface DebtWithDetails {
  _id: string;
  title: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  debtType: "given" | "taken";
  date: string;
  transactions: DebtTransaction[];
}

const DebtGrid: React.FC = () => {
  const [filter, setFilter] = useState<"Debt" | "Credit" | "History">("Debt");
  
  // Build query parameters based on filter
  const getQueryParams = () => {
    if (filter === "Debt") {
      return { debtType: 'taken', status: 'active' };
    } else if (filter === "Credit") {
      return { debtType: 'given', status: 'active' };
    } else {
      return { status: 'completed' };
    }
  };
  
  const { data, isLoading: loading, refetch } = useDebts();
  
  // Filter debts based on current filter
  const debts = React.useMemo(() => {
    if (!data?.debts) return [];
    const params = getQueryParams();
    return data.debts.filter((debt: any) => {
      if (params.debtType && debt.debtType !== params.debtType) return false;
      if (params.status === 'active' && debt.amountRemaining <= 0) return false;
      if (params.status === 'completed' && debt.amountRemaining > 0) return false;
      return true;
    });
  }, [data, filter]);

  const handleFilterChange = (value: "Debt" | "Credit" | "History") => {
    setFilter(value);
  };

  return (
    <>
      <Segmented
        options={["Debt", "Credit", "History"]}
        value={filter}
        onChange={handleFilterChange}
        style={{ margin: "0 16px 16px 16px" }}
        block
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "12px 24px 24px 24px",
          justifyContent: "center",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {loading ? (
          <>
            <LoadingSkeleton type="debt" quantity={3} />
          </>
        ) : debts.length === 0 ? (
          <NoTransactions
            message={
              filter === "Credit"
                ? "You have no Credits pending"
                : filter === "Debt"
                ? "You have no Debts pending"
                : "You have no Debt History"
            }
          />
        ) : (
          <>
            {debts.map((debt, index) => (
              <DebtCard
                key={debt._id}
                _id={debt._id}
                title={debt.title}
                totalAmount={debt.totalAmount}
                amountPaid={debt.amountPaid}
                amountRemaining={debt.amountRemaining}
                date={debt.date}
                debtType={debt.debtType}
                transactions={debt.transactions || []}
                onRefresh={refetch}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default DebtGrid;
