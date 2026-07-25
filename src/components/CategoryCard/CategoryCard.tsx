import { Card, Progress, Space } from "antd";
import CategoryModal from "../Modals/CategoryModal/CategoryModal";
import DeleteCategoryButton from "../Modals/DeleteCategoryModal/DeleteCategoryModal";
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol } from '@/utils/formatCurrency';

interface CategoryCardProps {
  id: string;
  category: string;
  totalSpend: number;
  budget: number;
  transactionCount: number;
  color: string;
  onSuccess?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  category,
  totalSpend,
  budget,
  transactionCount,
  color,
  onSuccess,
}) => {
  const { currency } = useCurrency();
  const spendPercentage = (totalSpend / budget) * 100;

  return (
    <Card
      title={category}
      hoverable
      style={{ width: 300 }}
      bordered={false}
      extra={
        <Space>
          <CategoryModal
            isEdit
            initialValues={{
              categoryName: category,
              budget: budget,
              color: color,
              _id: id,
            }}
            onSuccess={onSuccess}
          />
          <DeleteCategoryButton
            category={{
              _id: id,
              categoryName: category,
              budget: budget,
              color: color,
            }}
            onClose={onSuccess}
          />
        </Space>
      }
    >
      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: "1rem" }}
      >
        <p>Total Spend: {getCurrencySymbol(currency)}{totalSpend?.toFixed(2) || 0}</p>
        <p>Budget: {getCurrencySymbol(currency)}{budget?.toFixed(2) || 0}</p>
        <Progress
          percent={parseFloat(spendPercentage.toFixed(2))}
          status={spendPercentage >= 100 ? "exception" : "normal"}
          strokeColor={{
            "0%": color,
            "100%": spendPercentage >= 100 ? "#D64040" : color,
          }}
        />
        <p>Transactions: {transactionCount || 0}</p>
      </Space>
    </Card>
  );
};

export default CategoryCard;
