'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Member,
  Expense,
  Payment,
  mockMembers as initialMembers,
  mockExpenses as initialExpenses,
  recentPayments as initialPayments,
  PLAN_PRICES as initialPlanPrices
} from './mock-data';

export interface Plan {
  id: string;
  name: string;
  price: number;
}

const defaultPlans = Object.entries(initialPlanPrices).map(([name, price], i) => ({
  id: `p${i + 1}`,
  name,
  price
}));

interface AppContextType {
  members: Member[];
  expenses: Expense[];
  payments: Payment[];
  plans: Plan[];
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  setPlans: (plans: Plan[]) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addPayment: (payment: Payment, newPlan?: string, newExpiry?: string) => void;
  voidPayment: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authList = sessionStorage.getItem('auth');
    if (authList === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const login = () => {
    sessionStorage.setItem('auth', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem('auth');
    setIsLoggedIn(false);
  };

  const addMember = (member: Member) => {
    setMembers(prev => [...prev, member]);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addPayment = (payment: Payment, newPlan?: string, newExpiry?: string) => {
    setPayments(prev => [...prev, payment]);
    setMembers(prev => prev.map(m => {
      if (m.id === payment.memberId) {
        const updated = { ...m, lastPayment: payment.date };
        if (newPlan) updated.plan = newPlan as any;
        if (newExpiry) {
          updated.nextExpiry = newExpiry;
          
          // Re-evaluate status based on new Expiry vs simulated today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expiryDate = new Date(`${newExpiry}T00:00:00`);
          if (expiryDate >= today) {
            updated.status = 'Activo';
            updated.debt = 0;
            updated.daysOverdue = 0;
          }
        }
        return updated;
      }
      return m;
    }));
  };

  const voidPayment = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, voided: true } : p));
  };

  return (
    <AppContext.Provider value={{
      members, expenses, payments, plans, isLoggedIn, login, logout, setPlans, addMember, updateMember, addExpense, deleteExpense, addPayment, voidPayment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
