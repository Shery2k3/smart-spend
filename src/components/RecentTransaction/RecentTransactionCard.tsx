import { Card, Typography, Tag, Button, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import DeleteTransactionButton from "../Modals/DeleteTransactionModal/DeleteTransactionModal";
import TransactionModal from "../Modals/TransactionModal/TransactionModal";
import dayjs from "dayjs";
import type { MenuProps } from "antd";
import ViewNotesButton from "../Modals/ViewNotesModal/ViewNotesModal";
import { formatNumber, getCurrencySymbol } from '../../utils/formatCurrency';
import { useCurrency } from '@/hooks/useCurrency';

interface RecentTransactionCardProps {
  _id: string;
  title: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  notes?: string;
  onTransactionChange?: () => void;
}

const { Text } = Typography;

const RecentTransactionCard: React.FC<RecentTransactionCardProps> = ({
  _id,
  title,
  date,
  type,
  amount,
  category,
  notes,
  onTransactionChange,
}) => {
  const { currency } = useCurrency();
  const isExpense = type === "expense";

  const items: MenuProps["items"] = [
    {
      key: "edit",
      label: (
        <TransactionModal
          isEdit
          record={{ _id, title, date, type, amount, category, notes }}
          onClose={onTransactionChange}
        />
      ),
    },
    {
      key: "delete",
      label: (
        <DeleteTransactionButton
          record={{ _id, title, date, type, amount, category, notes }}
          onClose={onTransactionChange}
        />
      ),
    },
    ...(notes
      ? [
          {
            key: "view",
            label: <ViewNotesButton title={title} notes={notes} />,
          },
        ]
      : []),
  ];

  return (
    <Card size="small" bordered={false}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text strong>{title}</Text>
          </div>
          <div style={{ fontSize: 10, opacity: 0.75 }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {dayjs(date).format("DD MMM YYYY, hh:mm A")}
            </Text>
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", textAlign: "right" }}
        >
          <Tag
            style={{
              backgroundColor: type === "income" ? "#cdf345" : "#f75252",
              color: "#000",
              border: `1px solid ${type === "income" ? "#181c08" : "#240a0a"}`,
              padding: "4px 10px 4px 8px",
              fontWeight: 600,
              borderRadius: 100,
            }}
          >
            <span>
              {isExpense ? "- " : "+ "}{getCurrencySymbol(currency)} {formatNumber(amount)}
            </span>
          </Tag>
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined style={{ color: "#fff" }} />}
            />
          </Dropdown>
        </div>
      </div>
    </Card>
  );
};

export default RecentTransactionCard;
