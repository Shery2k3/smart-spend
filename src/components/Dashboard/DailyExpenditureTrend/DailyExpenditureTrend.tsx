"use client";
import { Card } from "antd";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDailyExpenditure } from "@/hooks/useApi";

const DailyExpenditureTrend: React.FC = () => {
  const { data = [], isLoading: loading } = useDailyExpenditure();

  return (
    <Card
      title="Last 30 Days Expenditure"
      bordered={false}
      loading={loading}
      style={{ height: "100%" }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 0,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            style={{ fontSize: "11px" }}
            interval={2}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(24, 24, 24, 0.9)",
              backdropFilter: "blur(5px)",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Bar
            dataKey="expenditure"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DailyExpenditureTrend;