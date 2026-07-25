"use client";
import RecentTransactionCard from "./RecentTransactionCard";
import NoTransactions from "../HelperComponents/NoTransactions";
import LoadingSkeleton from "../HelperComponents/LoadingSkeleton";
import { useTransactions } from "@/hooks/useApi";

interface TransactionData {
  _id: string;
  date: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  category: string;
  notes?: string;
}

const RecentTransaction = () => {
  const { data, isLoading } = useTransactions(1, 7);

  const transactions = data?.transactions || [];

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          padding: "0px 16px 16px 16px ",
          color: "var(--color-accent)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Recent Transactions</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {isLoading ? (
          <>
            <LoadingSkeleton type="transaction" quantity={4} />
          </>
        ) : transactions.length === 0 ? (
          <NoTransactions />
        ) : (
          transactions.map((transaction) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransaction;
