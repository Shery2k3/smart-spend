"use client";
import { Row, Col, Card } from "antd";
import {
  WalletOutlined,
  RiseOutlined,
  FallOutlined,
  BankOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { useMonthlyStats } from '@/hooks/useApi';

interface StatsData {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetUtilization: number;
}

const Stats: React.FC = () => {
  const { currency } = useCurrency();
  const { data: stats, isLoading: loading } = useMonthlyStats();

  const statsData = stats || {
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    budgetUtilization: 0,
  };

  return (
    <div style={{ padding: "0 16px", marginBottom: "8px" }}>
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ height: "100%" }}>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#8c8c8c",
                  textTransform: "uppercase",
                }}
              >
                Current Balance
              </div>
              <div style={{ color: "#cdf345", fontSize: "24px" }}>
                <WalletOutlined style={{ marginRight: "5px" }} /> {getCurrencySymbol(currency)}
                <CountUp
                  end={statsData.currentBalance}
                  separator=","
                  duration={1}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ height: "100%" }}>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#8c8c8c",
                  textTransform: "uppercase",
                }}
              >
                Income
              </div>
              <div style={{ color: "#45bcf3", fontSize: "24px" }}>
                <RiseOutlined style={{ marginRight: "5px" }} /> {getCurrencySymbol(currency)}
                <CountUp end={statsData.monthlyIncome} separator="," duration={1} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ height: "100%" }}>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#8c8c8c",
                  textTransform: "uppercase",
                }}
              >
                Expenses
              </div>
              <div style={{ color: "#f34545", fontSize: "24px" }}>
                <FallOutlined style={{ marginRight: "5px" }} /> {getCurrencySymbol(currency)}
                <CountUp
                  end={statsData.monthlyExpenses}
                  separator=","
                  duration={1}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ height: "100%" }}>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#8c8c8c",
                  textTransform: "uppercase",
                }}
              >
                Budget Utilization
              </div>
              <div
                style={{
                  color: statsData.budgetUtilization <= 75 ? "#cdf345" : "#f34545",
                  fontSize: "24px",
                }}
              >
                <BankOutlined style={{ marginRight: "5px" }} />
                <CountUp
                  end={statsData.budgetUtilization}
                  decimals={1}
                  duration={1}
                />
                %
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Stats;
