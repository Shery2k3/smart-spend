import MainLayout from "@/components/MainLayout/MainLayout";
import { Button, Card, Typography } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;

export default function Recurring() {
  return (
    <MainLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Card
          style={{ textAlign: "center", padding: "2rem", borderRadius: 12 }}
          bordered={false}
        >
          <h2 style={{ marginBottom: 8 }}>Recurring</h2>

          <p style={{ marginBottom: 24 }}>
            This feature is coming soon. Stay tuned!
          </p>

          <Link href="/dashboard">
            <Button type="primary">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    </MainLayout>
  );
}
