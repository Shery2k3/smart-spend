import { Card } from "antd";

const NoTransactions = ({ message = "No Recent Transactions" }) => (
  <Card bordered={false} style={{ width: "100%" }}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "32px 0",
      }}
    >
      <img
        src="/emptyWallet.png"
        alt="Empty wallet"
        style={{ width: "120px", height: "auto", opacity: 0.5 }}
      />
      <p
        style={{
          opacity: 0.5,
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {message}
      </p>
    </div>
  </Card>
);

export default NoTransactions;