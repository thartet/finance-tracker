"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trash2, Edit2, PlusCircle, XCircle } from "lucide-react";

type Transaction = {
  id: number;
  label: string;
  amount: number;
  date: string;
  category: string;
};

const predefinedCategories = [
  "Logement",
  "Travail",
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
  const [initialBalance, setInitialBalance] = useState(0);

  const loadInitialBalance = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/balance");
      if (res.ok) {
        const data = await res.json();
        setInitialBalance(data.initial || 0);
      }
    } catch (err) {
      console.error("Erreur récupération solde initial", err);
    }
  }, []);

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
    loadInitialBalance();
    loadTransactions();
  }, [loadInitialBalance, loadTransactions]);

  // **Ici on fait la somme simple des montants, positifs et négatifs, pour calculer le solde**
  const currentBalance = React.useMemo(() => {
    const totalTx = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    return initialBalance + totalTx;
  }, [transactions, initialBalance]);

  const handleAdd = async () => {
    if (
      !newTx.label ||
      !newTx.amount ||
      !newTx.category ||
      !newTx.date ||
      isNaN(Number(newTx.amount))
    ) {
      alert("Merci de remplir tous les champs correctement.");
      return;
    }
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
      await loadInitialBalance();
    } else {
      alert("Erreur lors de l’ajout de la transaction.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Confirmer la suppression de cette transaction ?");
    if (!confirmed) return;
    const res = await fetch(`http://localhost:3001/api/transactions/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadTransactions();
      await loadInitialBalance();
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (
      !editingData.label ||
      editingData.amount === undefined ||
      !editingData.category ||
      !editingData.date ||
      isNaN(Number(editingData.amount))
    ) {
      alert("Merci de remplir tous les champs correctement.");
      return;
    }
    const res = await fetch(`http://localhost:3001/api/transactions/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingData),
    });
    if (res.ok) {
      setEditingId(null);
      setEditingData({});
      await loadTransactions();
      await loadInitialBalance();
    } else {
      alert("Erreur lors de la mise à jour.");
    }
  };

  return (
    <main className="p-8 max-w-5xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 text-center">
        Suivi de mes transactions
      </h1>

      <div className="mb-6 text-xl font-semibold flex justify-center gap-2 items-center">
        <span>Solde actuel :</span>
        <span
          className={`${
            currentBalance >= 0 ? "text-green-600" : "text-red-600"
          } font-mono text-2xl`}
        >
          {currentBalance.toFixed(2)} €
        </span>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-2 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          <option value="all">Tous les mois</option>
          {Array.from(
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
            .sort((a, b) =>
              a.year === b.year ? a.month - b.month : a.year - b.year
            )
            .map(({ year, month }) => (
              <option key={`${year}-${month}`} value={`${year}-${month}`}>
                {`${month.toString().padStart(2, "0")}/${year}`}
              </option>
            ))}
        </select>

        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
        >
          <PlusCircle size={18} />
          Ajouter une transaction
        </button>

        <Link href="/dashboard/stats">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition">
            Voir les statistiques
          </button>
        </Link>

        <Link href="/settings">
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition">
            Paramètres
          </button>
        </Link>
      </div>

      {showForm && (
        <section className="mb-6 p-6 bg-indigo-50 rounded-md shadow-inner">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">
            Nouvelle transaction
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Libellé"
              value={newTx.label}
              onChange={(e) => setNewTx({ ...newTx, label: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <input
              type="number"
              placeholder="Montant (ex : 100 pour entrée, -50 pour dépense)"
              value={newTx.amount}
              onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              step="0.01"
            />
            <select
              value={newTx.category}
              onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
              className="border rounded px-3 py-2 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="">Choisir une catégorie</option>
              {predefinedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newTx.date}
              onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded shadow transition"
            >
              Enregistrer
            </button>
          </div>
        </section>
      )}

      <table className="w-full border-collapse shadow rounded-lg overflow-hidden">
        <thead className="bg-indigo-700 text-white">
          <tr>
            <th className="py-3 px-5 text-left">Date</th>
            <th className="py-3 px-5 text-left">Libellé</th>
            <th className="py-3 px-5 text-left">Catégorie</th>
            <th className="py-3 px-5 text-right">Montant (€)</th>
            <th className="py-3 px-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6">
                Aucune transaction à afficher.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.id} className="border-b hover:bg-indigo-50 transition">
                <td className="py-3 px-5">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="py-3 px-5">{tx.label}</td>
                <td className="py-3 px-5">{tx.category}</td>
                <td
                  className={`py-3 px-5 text-right font-mono ${
                    tx.amount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.amount.toFixed(2)}
                </td>
                <td className="py-3 px-5 text-center space-x-2">
                  {editingId === tx.id ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingData({});
                        }}
                        title="Annuler"
                        className="text-gray-500 hover:text-red-600"
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        title="Enregistrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        <PlusCircle size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(tx.id);
                          setEditingData(tx);
                        }}
                        title="Modifier"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        title="Supprimer"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
          {editingId !== null && (
            <tr className="bg-indigo-100">
              <td>
                <input
                  type="date"
                  value={editingData.date?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setEditingData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={editingData.label || ""}
                  onChange={(e) =>
                    setEditingData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                />
              </td>
              <td>
                <select
                  value={editingData.category || ""}
                  onChange={(e) =>
                    setEditingData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="">Choisir une catégorie</option>
                  {predefinedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={editingData.amount !== undefined ? editingData.amount : ""}
                  onChange={(e) =>
                    setEditingData((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                  className="border rounded px-2 py-1 text-right font-mono"
                />
              </td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
