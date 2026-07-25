"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useApi";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [currency, setCurrencyState] = useState<string>("USD");
  
  // Fetch user data using TanStack Query
  const { data: user } = useUser(session?.user?.userId || "");

  useEffect(() => {
    // Try to get currency from localStorage first
    const storedCurrency = localStorage.getItem("userCurrency");
    if (storedCurrency) {
      setCurrencyState(storedCurrency);
    }
  }, []);

  // Update currency when user data is fetched
  useEffect(() => {
    if (user?.currency) {
      setCurrencyState(user.currency);
      localStorage.setItem("userCurrency", user.currency);
    }
  }, [user]);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("userCurrency", newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
