"use client";
import CategoryCard from "../CategoryCard/CategoryCard";
import CategoryModal from "../Modals/CategoryModal/CategoryModal";
import { Card, message } from "antd";
import LoadingSkeleton from "../HelperComponents/LoadingSkeleton";
import { useCategories } from "@/hooks/useApi";

interface Category {
  _id: string;
  category: string;
  totalSpend: number;
  budget: number;
  color: string;
  transactionCount: number;
}

const CategoryGrid = () => {
  const { data: categories = [], isLoading, refetch } = useCategories();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        padding: "12px 24px 24px 24px",
        justifyContent: "center",
        alignItems: "stretch",
        width: "100%",
      }}
    >
      {isLoading ? (
        <>
          <LoadingSkeleton type="debt" quantity={3} />
        </>
      ) : (
        <>
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              id={category._id}
              category={category.category}
              totalSpend={category.totalSpend}
              budget={category.budget}
              transactionCount={category.transactionCount}
              color={category.color}
              onSuccess={refetch}
            />
          ))}
          <CategoryModal onSuccess={refetch} />
        </>
      )}
    </div>
  );
};

export default CategoryGrid;
