"use client";
import React, { useState } from "react";
import { Segmented, Pagination } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import RecentTransactionCard from "../RecentTransaction/RecentTransactionCard";
import NoTransactions from "../HelperComponents/NoTransactions";
import LoadingSkeleton from "../HelperComponents/LoadingSkeleton";
import { useTransactions } from "@/hooks/useApi";

dayjs.extend(customParseFormat);

interface TransactionData {
  _id: string;
  date: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  category: string;
  notes?: string;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const TransactionsTable = () => {
  const [filter, setFilter] = useState<"All" | "Income" | "Expense">("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useTransactions(page, pageSize, filter);

  const transactions = data?.transactions || [];
  const total = data?.pagination?.total || 0;

  const handleFilterChange = (value: "All" | "Income" | "Expense") => {
    setFilter(value);
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Segmented
        options={["All", "Income", "Expense"]}
        value={filter}
        onChange={handleFilterChange}
        style={{ marginBottom: 16 }}
        block
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {isLoading ? (
          <>
          <LoadingSkeleton type="transaction" quantity={4} />
        </>
        ) : transactions.length === 0 ? (
          <NoTransactions />
        ) : (
          <>
            {transactions.map((transaction) => (
              <RecentTransactionCard
                key={transaction._id}
                _id={transaction._id}
                title={transaction.title}
                date={transaction.date}
                type={transaction.type as "income" | "expense"}
                amount={transaction.amount}
                category={transaction.category}
                notes={transaction.notes}
              />
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
