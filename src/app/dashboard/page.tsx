"use client";
import CategoryBreakdown from "@/components/Dashboard/CategoryBreakdown/CategoryBreakdown";
import MonthlyBalanceTrend from "@/components/Dashboard/MonthlyBalanceTrend/MonthlyBalanceTrend";
import Stats from "@/components/Dashboard/Stats/Stats";
import MainLayout from "@/components/MainLayout/MainLayout";
import { useSession } from "next-auth/react";
import { Col, Row } from "antd";
import RecentTransaction from "@/components/RecentTransaction/RecentTransaction";
import { useUser } from "@/hooks/useApi";

export default function Dashboard() {
  const { data: session } = useSession();

    const { data: userData, isLoading: fetchingUser } = useUser(
      session?.user?.userId || ""
    );

  return (
    <MainLayout>
      <div
        style={{ padding: "24px 16px 8px 16px ", color: "var(--color-accent)" }}
      >
        <h2>Hi, {userData?.name || session?.user?.name || "Guest"} 👋</h2>
      </div>
      <Stats />
      <div style={{ padding: "0 16px" }}>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={12} lg={12}>
            <MonthlyBalanceTrend />
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <CategoryBreakdown />
          </Col>
        </Row>
      </div>
      <RecentTransaction />
    </MainLayout>
  );
}
