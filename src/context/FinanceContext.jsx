import React, { createContext, useContext, useState } from "react";

const FinanceContext = createContext(null);

const INITIAL_TRANSACTIONS = [
  {
    id: "TX-9041",
    date: "Today, 10:45 AM",
    description: "SaMD Clinical E-Prescription Consult — Dr. Sarah Jenkins",
    patientName: "Safan Khan",
    patientId: "PAT-1001",
    amount: 180.0,
    type: "income",
    category: "AI E-Rx Verification",
    status: "cleared"
  },
  {
    id: "TX-9040",
    date: "Today, 09:15 AM",
    description: "Emergency Bay Trauma Admission & Telemetry Hookup",
    patientName: "Marcus Vance",
    patientId: "PAT-1003",
    amount: 1250.0,
    type: "income",
    category: "ER Inpatient Care",
    status: "cleared"
  },
  {
    id: "TX-9039",
    date: "Yesterday",
    description: "Cloud GPU Inference & SaMD AI Model Cluster Lease",
    patientName: "Nobi Systems Infrastructure",
    patientId: "SYSTEM",
    amount: 420.5,
    type: "expense",
    category: "Inference Compute",
    status: "cleared"
  },
  {
    id: "TX-9038",
    date: "Yesterday",
    description: "Comprehensive Metabolic & Lipid OCR Processing Fee",
    patientName: "Safan Khan",
    patientId: "PAT-1001",
    amount: 85.0,
    type: "income",
    category: "Diagnostic OCR",
    status: "cleared"
  }
];

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  const addTransaction = (tx) => {
    const newTx = {
      ...tx,
      id: `TX-${Math.floor(9100 + Math.random() * 800)}`,
      date: "Just now",
      status: tx.status || "cleared"
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const totalRevenue = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const netOperatingIncome = totalRevenue - totalExpenses;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        totalRevenue,
        totalExpenses,
        netOperatingIncome
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}