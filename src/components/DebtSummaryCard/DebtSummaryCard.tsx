"use client";
import { Card, Col, Divider, Flex, Row, Skeleton } from "antd";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { useDebtPayments } from '@/hooks/useApi';

interface DebtSummary {
  outstandingDebt: number;
  outstandingCredit: number;
  takenCount: number;
  givenCount: number;
}

const DebtSummaryCard = () => {
  const { currency } = useCurrency();
  const { data: debtSummary, isLoading: loading } = useDebtPayments();

  const summary = debtSummary || {
    outstandingDebt: 0,
    outstandingCredit: 0,
    takenCount: 0,
    givenCount: 0,
  };

  const LoadingSkeleton = () => (
    <Card bordered={false} style={{ width: "100%" }}>
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );

  return (
    <div style={{ margin: "0 16px 24px 16px" }}>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Card bordered={false} style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col span={11}>
              <Flex vertical align="center" justify="center" gap={8}>
                <p style={{ opacity: 0.75 }}>Outstanding Debt</p>
                <h3>{getCurrencySymbol(currency)} {summary.outstandingDebt}</h3>
              </Flex>
            </Col>
            <Col span={2}>
              <Flex
                align="center"
                justify="center"
                gap={8}
                style={{ height: "100%" }}
              >
                <Divider type="vertical" style={{ height: "100%" }} />
              </Flex>
            </Col>
            <Col span={11}>
              <Flex vertical align="center" justify="center" gap={8}>
                <p style={{ opacity: 0.75 }}>Outstanding Credit</p>
                <h3>{getCurrencySymbol(currency)} {summary.outstandingCredit}</h3>
              </Flex>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default DebtSummaryCard;
