import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

// Query Keys
export const QUERY_KEYS = {
  transactions: (page?: number, pageSize?: number, type?: string) => 
    ['transactions', { page, pageSize, type }] as const,
  categories: ['categories'] as const,
  debts: (page?: number, pageSize?: number) => ['debts', { page, pageSize }] as const,
  debtPayments: ['debtPayments'] as const,
  user: (userId: string) => ['user', userId] as const,
  monthlyStats: ['monthlyStats'] as const,
  monthlyBalance: ['monthlyBalance'] as const,
  statement: (startDate: string, endDate: string) => 
    ['statement', { startDate, endDate }] as const,
};

// Types
interface Transaction {
  _id: string;
  date: string;
  type: "income" | "expense" | "debt";
  title: string;
  amount: number;
  category: string;
  notes?: string;
  debtType?: "given" | "taken";
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

interface Category {
  _id: string;
  category: string;
  totalSpend: number;
  budget: number;
  color: string;
  transactionCount: number;
}

interface Debt {
  _id: string;
  title: string;
  amount: number;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  debtType: "given" | "taken";
  date: string;
  category: string;
  notes?: string;
  transactions?: Array<{
    _id: string;
    type: "return" | "add";
    amount: number;
    date: string;
    reason?: string;
    category?: string;
  }>;
}

interface DebtsResponse {
  debts: Debt[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// Fetch functions
const fetchTransactions = async (
  page: number = 1,
  pageSize: number = 10,
  type?: string
): Promise<TransactionsResponse> => {
  let url = `/api/transactions?page=${page}&pageSize=${pageSize}`;
  if (type && type !== 'All') {
    url += `&type=${type.toLowerCase()}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('/api/category');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

const fetchDebts = async (
  page: number = 1,
  pageSize: number = 10
): Promise<DebtsResponse> => {
  const url = `/api/debts?page=${page}&pageSize=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch debts');
  }
  return response.json();
};

const fetchDebtPayments = async () => {
  const response = await fetch('/api/debt-payments');
  if (!response.ok) {
    throw new Error('Failed to fetch debt payments');
  }
  return response.json();
};

const fetchMonthlyStats = async () => {
  const response = await fetch('/api/analytics/monthly-stats');
  if (!response.ok) {
    throw new Error('Failed to fetch monthly stats');
  }
  return response.json();
};

const fetchMonthlyBalance = async () => {
  const response = await fetch('/api/analytics/monthly-balance');
  if (!response.ok) {
    throw new Error('Failed to fetch monthly balance');
  }
  return response.json();
};

const fetchUser = async (userId: string) => {
  const response = await fetch(`/api/users?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

const fetchStatement = async (startDate: string, endDate: string) => {
  const response = await fetch(
    `/api/transactions/statement?startDate=${startDate}&endDate=${endDate}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch statement');
  }
  return response.json();
};

// Query Hooks
export const useTransactions = (
  page: number = 1,
  pageSize: number = 10,
  type?: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(page, pageSize, type),
    queryFn: () => fetchTransactions(page, pageSize, type),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: fetchCategories,
  });
};

export const useDebts = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.debts(page, pageSize),
    queryFn: () => fetchDebts(page, pageSize),
  });
};

export const useDebtPayments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.debtPayments,
    queryFn: fetchDebtPayments,
  });
};

export const useMonthlyStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.monthlyStats,
    queryFn: fetchMonthlyStats,
  });
};

export const useMonthlyBalance = () => {
  return useQuery({
    queryKey: QUERY_KEYS.monthlyBalance,
    queryFn: fetchMonthlyBalance,
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.user(userId),
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
};

export const useStatement = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.statement(startDate, endDate),
    queryFn: () => fetchStatement(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

// Mutation Hooks
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Transaction added successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Transaction> & { _id: string }) => {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Transaction updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete transaction');
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const response = await fetch('/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Category created successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Category> & { _id: string }) => {
      const response = await fetch('/api/category', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Category updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/category?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete category');
    },
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Debt>) => {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create debt');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.debtPayments });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Debt added successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Debt> & { _id: string }) => {
      const response = await fetch(`/api/debts?id=${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update debt');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.debtPayments });
      message.success('Debt updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/debts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete debt');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.debtPayments });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Debt deleted successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete debt');
    },
  });
};

export const useCreateDebtPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/debt-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create debt payment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.debtPayments });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Debt payment added successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};

export const useUpdateDebtPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any & { _id: string }) => {
      const response = await fetch(`/api/debt-payments/${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update debt payment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.debtPayments });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyBalance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      message.success('Debt payment updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'An error occurred');
    },
  });
};
