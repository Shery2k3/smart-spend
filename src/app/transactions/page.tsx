import MainLayout from "@/components/MainLayout/MainLayout";
import TransactionModal from "@/components/TransactionModal/TransactionModal";
import TransactionsTable from "@/components/TransactionTable/TransactionTable";

export default function Transactions() {
  return (
    <>
      <div>
        <MainLayout>
          <TransactionsTable />
          <TransactionModal />
        </MainLayout>
      </div>
    </>
  );
}
