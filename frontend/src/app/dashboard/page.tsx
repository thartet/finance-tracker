"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Transaction = {
  id: number;
  label: string;
  amount: number;
  date: string;
  category: string;
};

const predefinedCategories = [
  "Logement",
  "Transport",
  "Alimentation",
  "Epargne",
  "Loisir / Vacances",
  "Habillement",
  "Abonnements",
  "Santé",
  "Service public",
  "Autre",
];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [newTx, setNewTx] = useState({
    label: "",
    amount: "",
    category: "",
    date: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Transaction>>({});

  const loadTransactions = useCallback(async () => {
    const url =
      selectedMonth === "all"
        ? "http://localhost:3001/api/transactions"
        : `http://locahost:3001/api/transactions?month=${selectedMonth}`;
  
    const res = await fetch(url);
    const data = await res.json();
    setTransactions(data);
  }, [selectedMonth]);
  
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAdd = async () => {
    const payload = {
      label: newTx.label,
      amount: parseFloat(newTx.amount),
      category: newTx.category,
      date: newTx.date,
    };

    const res = await fetch("http://localhost:3001/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setNewTx({ label: "", amount: "", category: "", date: "" });
      setShowForm(false);
      await loadTransactions();
    } else {
      alert("Erreur lors de l’ajout de la transaction.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Confirmer la suppression de cette dépense ?");
    if (!confirmed) return;

    const res = await fetch(`http://localhost:3001/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      await loadTransactions();
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditingData({ ...tx });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSave = async () => {
    if (!editingId) return;

    const res = await fetch(
      `http://localhost:3001/api/transactions/${editingId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingData),
      }
    );

    if (res.ok) {
      setEditingId(null);
      setEditingData({});
      await loadTransactions();
    } else {
      alert("Erreur lors de la mise à jour.");
    }
  };

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
      <h1 className="text-2xl font-bold mb-4">Dépenses</h1>

      <div className="flex items-center mb-4 gap-4">
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

        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          + Ajouter une dépense
        </button>

        <Link href="/dashboard/stats">
          <button className="bg-blue-600 text-white px-3 py-1 rounded">
            Voir les statistiques
          </button>
        </Link>
      </div>

      {showForm && (
        <div className="mb-4 border p-4 rounded bg-gray-100">
          <h2 className="font-semibold mb-2">Nouvelle dépense</h2>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <input
              className="border p-2"
              name="label"
              placeholder="Libellé"
              value={newTx.label}
              onChange={(e) => setNewTx({ ...newTx, label: e.target.value })}
            />
            <input
              className="border p-2"
              name="amount"
              placeholder="Montant"
              type="number"
              value={newTx.amount}
              onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
            />
            <select
              className="border p-2"
              value={newTx.category}
              onChange={(e) =>
                setNewTx({ ...newTx, category: e.target.value })
              }
            >
              <option value="">Choisir une catégorie</option>
              {predefinedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              className="border p-2"
              name="date"
              type="date"
              value={newTx.date}
              onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
            />
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Enregistrer
          </button>
        </div>
      )}

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Libellé</th>
            <th className="border px-4 py-2">Catégorie</th>
            <th className="border px-4 py-2">Montant (€)</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) =>
            editingId === tx.id ? (
              <tr key={tx.id} className="bg-yellow-50">
                <td className="border px-2 py-1">
                  <input
                    type="date"
                    value={editingData.date?.slice(0, 10) || ""}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        date: e.target.value,
                      })
                    }
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    value={editingData.label || ""}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        label: e.target.value,
                      })
                    }
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border px-2 py-1">
                  <select
                    value={editingData.category || ""}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        category: e.target.value,
                      })
                    }
                    className="border p-1 w-full"
                  >
                    {predefinedCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={editingData.amount?.toString() || ""}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        amount: parseFloat(e.target.value),
                      })
                    }
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={tx.id}>
                <td className="border px-4 py-2">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">{tx.label}</td>
                <td className="border px-4 py-2">{tx.category}</td>
                <td className="border px-4 py-2">{tx.amount.toFixed(2)}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => startEdit(tx)}
                    className="bg-yellow-500 px-2 py-1 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </main>
  );
}
