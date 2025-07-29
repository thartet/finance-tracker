"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const loadTransactions = useCallback(async () => {
    const url =
      selectedMonth === "all"
        ? "http://localhost:3001/api/transactions"
        : `http://localhost:3001/api/transactions?month=${selectedMonth}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Erreur récupération transactions", err);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Ne garder que les dépenses (montants négatifs), en valeur absolue, pour le graphique par catégorie
  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach(({ category, amount }) => {
      if (amount < 0) {
        totals[category] = (totals[category] || 0) + Math.abs(amount);
      }
    });
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  // Calcul des totaux revenus / dépenses pour le graphique comparatif
  const revenuesVsExpenses = React.useMemo(() => {
    let totalRevenues = 0;
    let totalExpenses = 0;

    transactions.forEach(({ amount }) => {
      if (amount > 0) totalRevenues += amount;
      else totalExpenses += Math.abs(amount);
    });

    return [
      { type: "Revenus", value: totalRevenues },
      { type: "Dépenses", value: totalExpenses },
    ];
  }, [transactions]);

  const monthOptions = Array.from(
    new Set(
      transactions.map((tx) => {
        const date = new Date(tx.date);
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
      })
    )
  )
    .map((str) => {
      const [year, month] = str.split("-").map(Number);
      return { year, month };
    })
    .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

  return (
    <main className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 text-center">
        Statistiques financières
      </h1>

      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="month-select" className="font-semibold text-indigo-700">
          Filtrer par mois :
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-2 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          <option value="all">Tous les mois</option>
          {monthOptions.map(({ year, month }) => (
            <option key={`${year}-${month}`} value={`${year}-${month}`}>
              {`${month.toString().padStart(2, "0")}/${year}`}
            </option>
          ))}
        </select>
      </div>

      {/* Titre graphique dépenses par catégorie */}
      <h2 className="text-xl font-semibold text-indigo-700 mb-4 text-center">
        Répartition des dépenses par catégorie
      </h2>
      <div className="w-full h-80 mb-12">
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

      {/* Titre graphique comparaison Revenus vs Dépenses */}
      <h2 className="text-xl font-semibold text-indigo-700 mb-4 text-center">
        Comparaison des revenus et dépenses totales
      </h2>
      <div className="w-full h-64 mb-6">
        <ResponsiveContainer>
          <BarChart
            data={revenuesVsExpenses}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toFixed(2) + " €"} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bouton retour en bas */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mt-8 w-full inline-flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        type="button"
        aria-label="Retour au dashboard"
      >
        ← Retour au Dashboard
      </button>
    </main>
  );
}
