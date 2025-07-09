"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Transaction = {
  id: number;
  label: string;
  amount: number;
  date: string;
  category: string;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28BFE",
  "#FE6F6F",
  "#6FFECD",
  "#FEA7F1",
  "#A0FE7E",
  "#FF6F94",
];

export default function StatsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const loadTransactions = useCallback(async () => {
    const url =
      selectedMonth === "all"
        ? "http://localhost:3001/api/transactions"
        : `http://localhost:3001/api/transactions?month=${selectedMonth}`;
  
    const res = await fetch(url);
    const data = await res.json();
    setTransactions(data);
  }, [selectedMonth]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach(({ category, amount }) => {
      totals[category] = (totals[category] || 0) + amount;
    });
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const monthOptions = Array.from(
    new Set(
      transactions.map((tx) => {
        const date = new Date(tx.date);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      })
    )
  )
    .map((str) => {
      const [year, month] = str.split("-").map(Number);
      return { year, month };
    })
    .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Statistiques des dépenses</h1>

      <div className="mb-6">
        <label className="mr-2 font-semibold">Filtrer par mois :</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="all">Tous les mois</option>
          {monthOptions.map(({ year, month }) => (
            <option key={`${year}-${month}`} value={`${year}-${month}`}>
              {`${month.toString().padStart(2, "0")}/${year}`}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={categoryTotals}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, percent }) =>
                `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
              }
            >
              {categoryTotals.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => value.toFixed(2) + " €"} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
