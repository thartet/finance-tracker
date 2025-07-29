"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch("http://localhost:3001/api/balance");
        if (res.ok) {
          const data = await res.json();
          setInitialBalance(data.initial || 0);
          setInputValue((data.initial || 0).toString());
        }
      } catch (err) {
        console.error("Erreur récupération solde initial", err);
      }
    }
    fetchBalance();
  }, []);

  const handleSave = async () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      alert("Veuillez entrer un nombre valide");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/api/balance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initial: value }),
      });
      if (res.ok) {
        alert("Solde initial mis à jour !");
        setInitialBalance(value);
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (err) {
      console.error("Erreur réseau", err);
      alert("Erreur réseau.");
    }
  };

  if (initialBalance === null) {
    return (
      <main className="p-6 max-w-md mx-auto text-center text-indigo-600 font-semibold">
        Chargement...
      </main>
    );
  }

  return (
    <main className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 text-center">
        Paramètres
      </h1>

      <div className="mb-6">
        <label className="block mb-2 font-semibold text-indigo-700">
          Solde initial (€)
        </label>
        <input
          type="number"
          step="0.01"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border border-indigo-300 rounded px-4 py-2 w-full
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          placeholder="Entrez le solde initial"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white
                   font-semibold px-6 py-3 rounded shadow transition"
      >
        Enregistrer
      </button>

      {/* Bouton retour en dessous */}
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
