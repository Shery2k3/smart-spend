"use client";

import { useEffect } from "react";
import { message } from "antd";
import { useQueryClient } from "@tanstack/react-query";

export default function SyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = async () => {
      console.log("Internet restored. Checking for pending transactions...");

      const pendingData = localStorage.getItem("offlineTransactions");
      if (pendingData) {
        const transactions = JSON.parse(pendingData);

        if (transactions.length > 0) {
          message.loading({ content: "Syncing offline data...", key: "sync" });

          try {
            // Har pending transaction ko MongoDB me push karein
            for (const tx of transactions) {
              await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tx),
              });
            }

            // Sync successful hone ke baad:
            localStorage.removeItem("offlineTransactions");
            message.success({
              content: "Offline data synced successfully!",
              key: "sync",
            });

            // React Query se dashboard/transactions ka data refresh karwayein
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["monthly-stats"] });
          } catch (error) {
            console.error("Sync failed:", error);
            message.error({
              content: "Failed to sync offline data.",
              key: "sync",
            });
          }
        }
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [queryClient]);

  return <>{children}</>;
}
