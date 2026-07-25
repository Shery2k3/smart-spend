import MainLayout from "@/components/MainLayout/MainLayout";
import StatementModal from "@/components/Modals/StatementModal/StatementModal";
import TransactionsTable from "@/components/TransactionTable/TransactionTable";

export default function Transactions() {
  return (
    <>
      <div>
        <MainLayout>
          <div
            style={{
              padding: "16px 16px 16px 16px ",
              color: "var(--color-accent)",
            }}
          >
            <h2 style={{ textAlign: "center" }}>Transaction History</h2>
          </div>
          {/* <StatementModal /> */}
          <TransactionsTable />
        </MainLayout>
      </div>
    </>
  );
}
