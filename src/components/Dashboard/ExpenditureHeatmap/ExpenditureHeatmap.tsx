"use client";
import { Card, Tooltip } from "antd";
import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useDailyExpenditure } from "@/hooks/useApi";
import { useCurrency } from "@/hooks/useCurrency";
import { getCurrencySymbol } from "@/utils/formatCurrency";

type DailyPoint = {
  date: string; // YYYY-MM-DD
  label: string;
  expenditure: number;
};

const CELL_SIZE = 11;
const CELL_GAP = 3;

// Empty-state color, then 4 increasing intensity buckets
const COLOR_SCALE = ["#2d2d2d", "#4a1414", "#7a1f1f", "#b12b2b", "#EF4444"];

const getColor = (value: number, max: number) => {
  if (value <= 0 || max <= 0) return COLOR_SCALE[0];
  const ratio = value / max;
  if (ratio <= 0.25) return COLOR_SCALE[1];
  if (ratio <= 0.5) return COLOR_SCALE[2];
  if (ratio <= 0.75) return COLOR_SCALE[3];
  return COLOR_SCALE[4];
};

const ExpenditureHeatmap: React.FC = () => {
  const { data = [], isLoading: loading } = useDailyExpenditure("year");
  const { currency } = useCurrency();

  const { weeks, max, monthLabels } = useMemo(() => {
    const points: DailyPoint[] = data;
    if (!points.length) return { weeks: [] as (DailyPoint | null)[][], max: 0, monthLabels: [] as { index: number; label: string }[] };

    // Pad the front so the grid starts on a Sunday, GitHub-style
    const firstDay = dayjs(points[0].date).day(); // 0 = Sunday
    const padded: (DailyPoint | null)[] = [
      ...Array.from({ length: firstDay }, () => null),
      ...points,
    ];

    const weeks: (DailyPoint | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    const max = Math.max(...points.map((p) => p.expenditure), 0);

    // Label the first week each new month appears in
    const monthLabels: { index: number; label: string }[] = [];
    let lastMonth = "";
    weeks.forEach((week, i) => {
      const firstReal = week.find((d) => d !== null);
      if (!firstReal) return;
      const month = dayjs(firstReal.date).format("MMM");
      if (month !== lastMonth) {
        monthLabels.push({ index: i, label: month });
        lastMonth = month;
      }
    });

    return { weeks, max, monthLabels };
  }, [data]);

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <Card
      title="Spending Heatmap"
      bordered={false}
      loading={loading}
      style={{ height: "100%" }}
    >
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", minWidth: 620 }}>
          {/* Month labels */}
          <div style={{ display: "flex", marginLeft: 28 }}>
            {weeks.map((_, i) => {
              const found = monthLabels.find((m) => m.index === i);
              return (
                <div
                  key={i}
                  style={{
                    flex: "1 1 0",
                    fontSize: 11,
                    color: "#8c8c8c",
                  }}
                >
                  {found?.label || ""}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex" }}>
            {/* Day-of-week labels */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: CELL_GAP,
                marginRight: 8,
                width: 20,
                flexShrink: 0,
              }}
            >
              {dayLabels.map((label, i) => (
                <div
                  key={i}
                  style={{
                    height: CELL_SIZE,
                    fontSize: 10,
                    color: "#8c8c8c",
                    lineHeight: `${CELL_SIZE}px`,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div style={{ display: "flex", gap: CELL_GAP, flex: 1, justifyContent: "space-between" }}>
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  style={{ display: "flex", flexDirection: "column", gap: CELL_GAP, flex: "1 1 0" }}
                >
                  {week.map((day, di) => {
                    if (!day) {
                      return (
                        <div
                          key={di}
                          style={{
                            width: "100%",
                            aspectRatio: "1 / 1",
                            borderRadius: 3,
                          }}
                        />
                      );
                    }
                    const color = getColor(day.expenditure, max);
                    return (
                      <Tooltip
                        key={di}
                        title={`${day.label}: ${getCurrencySymbol(currency)}${day.expenditure.toLocaleString()}`}
                      >
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "1 / 1",
                            borderRadius: 3,
                            background: color,
                            border: "1px solid rgba(255,255,255,0.06)",
                            cursor: "pointer",
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
              marginLeft: 28,
              fontSize: 11,
              color: "#8c8c8c",
            }}
          >
            <span style={{ marginRight: 4 }}>Less</span>
            {COLOR_SCALE.map((color, i) => (
              <div
                key={i}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRadius: 3,
                  background: color,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
            ))}
            <span style={{ marginLeft: 4 }}>More</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpenditureHeatmap;
